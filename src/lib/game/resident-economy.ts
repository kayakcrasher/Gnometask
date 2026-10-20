import type { GameSave, Raid } from "./types";
import { economicClimate, liveSharePrice } from "./island-economy";
import { PARCELS, parcelAccessOpen, parcelAt } from "./data/parcels";
import { landQuote } from "./land-market";
import { civicParcelOwner, parcelBuildingSpot } from "./land-planning";
import { npcBuildAllowed } from "./town-planning";
import { safeNpcSpot } from "./npc-brain";
/** Process one household at a time. Poverty has several outcomes; it never marks everyone as criminal. */
export function residentEconomy(s: GameSave & { raids?: Raid[] }) {
  const climate = economicClimate(s),
    civic = {
      ...s.civic,
      gnomes: s.civic.gnomes.map((g) => ({
        ...g,
        northDeeds: [...(g.northDeeds ?? [])],
        portfolio: { ...(g.portfolio ?? {}) },
      })),
    },
    economy = { ...s.economy };
  let coins = s.coins;
  const regulars = civic.gnomes.filter((g) => !g.archetype),
    g = regulars[civic.beat % regulars.length];
  if (!g) return { civic, economy, coins };
  const idHash = [...g.id].reduce((n, c) => n + c.charCodeAt(0), 0),
    owner = civic.plots.find((p) => p.owner === g.id);
  if (owner && g.housing === "homeless") {
    g.housing = "housed";
    g.crime = "none";
    g.hardship = 0;
    civic.news = `${g.name} has a roof again. The workshop wages finally covered a home.`;
  }
  if (g.purse < 25 && (g.portfolio.g500 ?? 0) > 0) {
    g.purse += liveSharePrice("g500", climate.day, climate.factor);
    g.portfolio.g500 = Math.max(0, (g.portfolio.g500 ?? 0) - 1);
  } else if (
    climate.jobs >= 2 &&
    g.purse > 300 &&
    (g.portfolio.g500 ?? 0) < 5
  ) {
    const price = liveSharePrice("g500", climate.day, climate.factor);
    if (price < g.purse - 150) {
      g.purse -= price;
      g.portfolio.g500 = (g.portfolio.g500 ?? 0) + 1;
    }
  }
  if (g.purse < 40 && g.northDeeds.length) {
    const id = g.northDeeds.find(
        (id) =>
          !civic.plots.some(
            (p) => p.id === `north-deed-${id}` && p.stories > 0,
          ),
      ),
      tile = id ? parcelAt(id) : null;
    if (tile && id) {
      g.purse += landQuote({ ...s, civic }, tile).sell;
      g.northDeeds = g.northDeeds.filter((d) => d !== id);
      civic.plots = civic.plots.filter((p) => p.id !== `north-deed-${id}`);
      civic.news = `${g.name} sold unused northern land to keep the household afloat.`;
    }
  }
  if ((g.hardship ?? 0) >= 8 && g.purse < 16 && g.housing !== "homeless") {
    g.housing = "homeless";
    civic.plots = civic.plots.map((p) => {
      const shares = p.shares.filter((id) => id !== g.id);
      return p.owner === g.id
        ? { ...p, owner: shares[0] ?? null, shares, rental: false }
        : p.shares.includes(g.id)
          ? { ...p, shares }
          : p;
    });
    civic.news = `${g.name}'s savings ran out. The family is staying at the northern waystation while looking for work.`;
  }
  if (g.housing === "homeless") {
    const camp = safeNpcSpot({ x: 1130 + (idHash % 4) * 22, y: -710 });
    g.x = camp.x;
    g.y = camp.y;
    if (economy.relief >= 12) {
      economy.relief -= 12;
      g.purse += 12;
      g.hardship = Math.max(0, (g.hardship ?? 0) - 1);
      g.line = `${g.name}: A hot supper and a little help. We are still trying.`;
    }
    if (
      (g.hardship ?? 0) >= 12 &&
      g.id.startsWith("settler-") &&
      idHash % 3 === 0
    ) {
      civic.gnomes = civic.gnomes.filter((n) => n.id !== g.id);
      civic.news = `${g.name}'s family left for work on another island. Their house and land remain.`;
      return { civic, economy, coins };
    }
    if (idHash % 3 === 1 && g.purse < 30) {
      g.crime = idHash % 2 ? "contraband" : "theft";
      const victim = civic.gnomes.find((n) => n.id !== g.id && n.purse >= 20);
      if (victim) {
        const pay = g.crime === "theft" ? 4 : 5;
        victim.purse -= pay;
        g.purse += pay;
        civic.news =
          g.crime === "theft"
            ? `${g.name} stole a few coins from ${victim.name}. The watch is looking into it.`
            : `${g.name} sold unlicensed moonshine to ${victim.name}. The contraband trade is reaching the waystation.`;
      }
    } else {
      g.crime = "none";
      if (climate.jobs >= 2) g.purse += 10;
      g.line = `${g.name}: I will mend roofs, unload a wagon, anything honest. We want a home again.`;
    }
    const vacant = civic.plots.find(
      (p) =>
        !p.owner &&
        !p.shares.length &&
        p.stories > 0 &&
        npcBuildAllowed({ ...s, civic }, { ...p, shares: [g.id] }),
    );
    if (vacant && g.purse >= 120) {
      g.purse -= 120;
      g.housing = "housed";
      g.crime = "none";
      g.hardship = 0;
      g.x = vacant.x;
      g.y = vacant.y + 30;
      civic.plots = civic.plots.map((p) =>
        p.id === vacant.id ? { ...p, owner: g.id, shares: [g.id] } : p,
      );
      civic.news = `${g.name}'s family paid 120 coins from saved wages and moved into a vacant home.`;
    }
  }
  // A real buyer, a real deed and a real household purse. Land held by players stays private.
  if (
    g.housing !== "homeless" &&
    climate.jobs >= 2 &&
    g.purse > 700 &&
    g.northDeeds.length < 1
  ) {
    const tile = PARCELS.find(
      (p) =>
        p.northern &&
        !p.owner &&
        !s.deeds.includes(p.id) &&
        parcelAccessOpen(p, s.roadWorks.completed) &&
        !civicParcelOwner(p, civic) &&
        g.purse >= landQuote({ ...s, civic }, p).buy + 150 &&
        !!parcelBuildingSpot(p, civic.plots),
    );
    if (tile) {
      const price = landQuote({ ...s, civic }, tile).buy,
        spot = parcelBuildingSpot(tile, civic.plots)!;
      g.purse -= price;
      g.northDeeds.push(tile.id);
      civic.plots = [
        {
          id: `north-deed-${tile.id}`,
          town: "haven",
          ...spot,
          shares: [g.id],
          stories: 0,
          owner: null,
          rental: false,
          lantern: false,
          trim: [],
        },
        ...civic.plots,
      ];
      if (economy.gateway && g.purse >= 2) {
        g.purse -= 2;
        coins += 2;
        economy.gatewayEarned += 2;
      }
      civic.news = `${g.name} bought northern land for ${price} coins. ${economy.gateway ? s.city.name + " welcomed another northbound household." : "A new family is planning a life beyond the mountain."}`;
    }
  }
  return { civic, economy, coins };
}

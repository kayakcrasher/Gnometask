import { useGame } from "@/lib/game/store";
import { economicClimate } from "@/lib/game/island-economy";
export function IslandOutlook() {
  const s = useGame(),
    c = economicClimate(s),
    homeless = s.civic.gnomes.filter((g) => g.housing === "homeless"),
    crime = s.civic.gnomes.filter(
      (g) => g.crime === "theft" || g.crime === "contraband",
    );
  return (
    <section
      aria-label="Island economy and relief"
      className="mb-3 rounded-2xl bg-gold/15 p-3 text-ink"
    >
      <h3 className="font-display text-lg font-bold capitalize">
        Island outlook · {c.phase}
      </h3>
      <p className="text-xs">
        Exchange index {c.index} · Market day {c.day} · {homeless.length}{" "}
        homeless households · {crime.length} residents involved in crime
      </p>
      <p className="mt-2 text-xs">
        {c.headline} Clearing raids and repairing homes helps restore trade.
        Building costs and household savings still matter.
      </p>
      <p className="mt-2 text-xs">
        Waystation relief fund: {s.economy.relief} coins. Families receive small
        grants while seeking work and a home.
      </p>
      <button
        type="button"
        disabled={s.coins < 30}
        onClick={() => s.contributeRelief()}
        className="mt-2 min-h-11 w-full rounded-xl bg-pine px-3 text-xs font-bold text-parchment disabled:opacity-40"
      >
        Contribute 30 coins to relief
      </button>
      {homeless.length > 0 && (
        <p className="mt-2 text-xs">
          Seeking a home:{" "}
          {homeless
            .slice(0, 5)
            .map((g) => g.name)
            .join(", ")}
        </p>
      )}
    </section>
  );
}
export function NorthGatewayPanel() {
  const s = useGame(),
    c = economicClimate(s),
    ready =
      s.townHallLevel >= 4 &&
      s.roadWorks.completed.includes("noble-reach") &&
      s.city.buildings.some((b) => b.kind === "home") &&
      s.city.buildings.some((b) => b.kind === "depot" && b.y < -300) &&
      c.jobs >= 2;
  return (
    <section
      aria-label="Gateway to the North"
      className="mt-3 rounded-xl bg-gold/20 p-3"
    >
      <h3 className="font-display text-lg font-bold">
        Gateway to the Rugged North
      </h3>
      <p className="my-1 text-xs">
        Build a northern trade depot and welcome families travelling beyond
        Mount Noble. A gateway charter raises northern land demand. Buyers pay a
        2-coin arrival levy from their own purses.
      </p>
      {s.economy.gateway ? (
        <p className="text-xs font-bold">
          {s.city.name} holds the charter · {s.economy.gatewayEarned} coins in
          levies received
        </p>
      ) : (
        <>
          <button
            type="button"
            disabled={!ready || s.coins < 1200}
            onClick={() => s.charterNorthGateway()}
            className="min-h-11 w-full rounded-xl bg-pine px-3 text-xs font-bold text-parchment disabled:opacity-40"
          >
            Charter your gateway city · 1,200 coins
          </button>
          <p className="mt-1 text-[11px]">
            Requires Hall 4, a city home, a depot north of Mount Noble, Noble
            Reach avenue and a stable or booming economy.
          </p>
        </>
      )}
      <p className="mt-2 text-xs">
        {s.civic.gnomes.reduce((n, g) => n + (g.northDeeds?.length ?? 0), 0)}{" "}
        northern deeds bought by gnomes · Your realised land profit/loss:{" "}
        {s.economy.landProfit} coins
      </p>
    </section>
  );
}

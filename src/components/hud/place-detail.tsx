import { Check } from "lucide-react";
import { CATALOG_BY_ID } from "@/lib/game/catalog";
import { metricLabel, regionValue, todaysLocationTasks } from "@/lib/game/metrics";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import { PLACES } from "@/lib/game/types";

export function PlaceDetail() {
  const selected = useGame((s) => s.selectedPlace);
  const metric = useGame((s) => s.metric);
  const save = useGame();
  const toggleTask = useGame((s) => s.toggleTask);
  const place = PLACES.find((p) => p.id === selected);

  if (!place) {
    return (
      <div className="flex h-full flex-col">
        <h2 className="font-display text-2xl font-semibold text-ink">The land</h2>
        <p className="mt-1 text-sm font-semibold text-bark/70">
          Tap a patch on the map. The dock, mines, and ruins sit beyond the village — and Ember still keeps the ridge.
        </p>
        <p className="mt-4 text-sm font-semibold text-bark/70">
          Open Chores for the daily list: get out of bed, brush your teeth, water the garden.
        </p>
      </div>
    );
  }

  const value = regionValue(save, place.id, metric);
  const here = todaysLocationTasks(save, place.id);
  const remaining = here.filter((t) => !t.done).length;
  const built = save.placed.filter((p) => {
    const item = CATALOG_BY_ID[p.catalogId];
    if (place.id === "village") return item?.kind === "village";
    if (place.id === "garden") return item?.kind === "garden";
    return false;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">On the land</p>
      <h2 className="font-display text-2xl font-semibold text-ink">{place.name}</h2>
      <p className="mt-1 text-sm font-semibold leading-snug text-bark/75">{place.blurb}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[16px] bg-parchment-dark/55 px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-bark/55">This measure</p>
          <p className="font-display text-lg font-semibold leading-tight text-ink tabular-nums">
            {metricLabel(value, metric)}
          </p>
        </div>
        <div className="rounded-[16px] bg-parchment-dark/55 px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-bark/55">Chores here</p>
          <p className="font-display text-lg font-semibold leading-tight text-ink tabular-nums">
            {remaining} open
          </p>
        </div>
      </div>

      {place.id === "village" ? (
        <p className="mt-3 text-sm font-semibold text-bark/75">
          {built.length === 0
            ? "Just the shop so far. Buy a stall or a well, then place it beside the shop and the village begins."
            : `${built.length} placed around the shop. Keep going; streets remember.`}
        </p>
      ) : null}

      {place.id === "wildlands" || place.id === "mines" || place.id === "ruins" || place.id === "dock" ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm font-semibold text-bark/75">
            {place.id === "wildlands"
              ? save.lifeDragon.state === "soothed" || save.lifeDragon.state === "defeated"
                ? "The ridge is quiet. Tap a beast on the map, or rest."
                : "Tap the glowing creatures. Or walk up to the dragon with a sword — or a honey cake."
              : place.id === "mines"
                ? "Lantern bats in the dark. Tap one, or delve."
                : place.id === "ruins"
                  ? "Rubble sprites in the gaps. Tap one, or poke about."
                  : "The crab has a union. Tap it, or check the lines."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => save.startPatrol(place.id)}
              className="h-11 flex-1 rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment"
            >
              {place.id === "mines" ? "Delve" : place.id === "ruins" ? "Poke about" : place.id === "dock" ? "Check the lines" : "Patrol"}
            </button>
            {place.id === "wildlands" && save.lifeDragon.state !== "defeated" && save.lifeDragon.state !== "soothed" ? (
              <button
                type="button"
                onClick={() => save.startDragon()}
                className="h-11 flex-1 rounded-[14px] bg-berry font-display text-sm font-semibold text-parchment"
              >
                Face Ember
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {place.id === "cottage" && save.houseUpgrades.length > 0 ? (
        <p className="mt-3 text-sm font-semibold text-bark/75">
          Cottage fittings: {save.houseUpgrades.length} of 7.
        </p>
      ) : null}

      {place.id === "cottage" ? (
        <button
          type="button"
          onClick={() => save.sipTea()}
          className="mt-3 h-11 w-full rounded-[14px] bg-parchment font-display text-sm font-semibold text-ink shadow-[0_0_0_1px_rgba(91,66,48,0.08)]"
        >
          Have a cup of tea — restore heart
        </button>
      ) : null}

      {built.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {built.map((b) => (
            <li key={b.id} className="rounded-full bg-moss/15 px-2.5 py-1 text-[11px] font-bold text-pine">
              {CATALOG_BY_ID[b.catalogId]?.name}
            </li>
          ))}
        </ul>
      ) : null}

      {save.placingId ? (
        <p className="mt-3 rounded-[14px] bg-gold/30 px-3 py-2 text-sm font-bold text-ink">
          Tap a glowing plot to place your {CATALOG_BY_ID[save.placingId]?.name.toLowerCase()}.
        </p>
      ) : null}

      {here.length > 0 ? (
        <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {here.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[16px] bg-parchment px-3 py-2.5 text-left shadow-[0_0_0_1px_rgba(91,66,48,0.08)]",
                  task.done && "opacity-55",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[8px] border-2 border-moss",
                    task.done && "bg-moss",
                  )}
                >
                  <Check className={cn("size-4 text-parchment", task.done ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                </span>
                <span className={cn("text-[15px] font-bold text-ink", task.done && "line-through decoration-bark/40")}>
                  {task.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

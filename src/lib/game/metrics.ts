import { CATALOG_BY_ID, GARDEN_FEATURE_SLOTS, GARDEN_SLOTS, VILLAGE_SLOTS } from "./catalog";
import type { GameSave, MetricId, PlaceId } from "./types";
import { localDate } from "@/lib/utils";
import { havenLevel } from "./world";

export function placedOfKind(save: GameSave, kind: "garden" | "village" | "house") {
  if (kind === "house") return save.houseUpgrades.length;
  return save.placed.filter((p) => CATALOG_BY_ID[p.catalogId]?.kind === kind).length;
}

export function todaysLocationTasks(save: GameSave, place: PlaceId) {
  const today = localDate();
  return save.tasks.filter((t) => {
    if (t.location !== place) return false;
    if (t.builtin) return t.createdOn === today;
    return !t.done || t.doneOn === today;
  });
}

export function regionValue(save: GameSave, place: PlaceId, metric: MetricId): number {
  const haven = havenLevel(
    save.placed.filter((p) => p.slotId.startsWith("v")).length,
    save.daysPlayed,
    save.wildWins,
  );
  if (metric === "care") {
    const tasks = todaysLocationTasks(save, place);
    if (!tasks.length) return place === "haven" ? (haven > 0 ? 0.3 : 0.08) : 0.22;
    return tasks.filter((t) => t.done).length / tasks.length;
  }

  if (metric === "bloom") {
    const watered = save.tasks.some(
      (t) => t.builtinKey === "water-beds" && t.done && t.doneOn === localDate(),
    );
    const gardenFill =
      save.placed.filter((p) => p.slotId.startsWith("g") || p.slotId.startsWith("gf")).length /
      (GARDEN_SLOTS.length + GARDEN_FEATURE_SLOTS.length);
    switch (place) {
      case "garden":
        return Math.min(1, gardenFill * 0.75 + (watered ? 0.25 : 0));
      case "woods":
        return 0.55 + (save.streak > 3 ? 0.15 : 0);
      case "pond":
        return 0.5;
      case "cottage":
        return save.houseUpgrades.includes("house-boxes") ? 0.72 : 0.28;
      case "village":
        return Math.min(1, 0.15 + placedOfKind(save, "village") / VILLAGE_SLOTS.length);
      case "shop":
        return 0.4 + Math.min(0.4, save.ownedHats.length * 0.06);
      case "wildlands":
        return save.lifeDragon.state === "defeated" || save.lifeDragon.state === "soothed"
          ? 0.72
          : 0.22 + Math.min(0.4, save.wildWins * 0.08);
      case "mines":
        return 0.18 + Math.min(0.5, save.wildWins * 0.06);
      case "ruins":
        return 0.28 + (save.streak > 2 ? 0.12 : 0);
      case "dock":
        return 0.42;
      case "haven":
        return Math.min(1, 0.1 + haven * 0.18);
    }
  }

  switch (place) {
    case "village":
      return placedOfKind(save, "village") / VILLAGE_SLOTS.length;
    case "shop":
      return Math.min(1, 0.35 + save.placed.length * 0.05);
    case "cottage":
      return Math.min(1, save.houseUpgrades.length / 11);
    case "garden":
      return placedOfKind(save, "garden") / (GARDEN_SLOTS.length + GARDEN_FEATURE_SLOTS.length);
    case "pond":
      return 0.3;
    case "woods":
      return Math.min(1, 0.2 + save.streak * 0.04);
    case "wildlands":
      return save.lifeDragon.state === "defeated" ? 0.85 : Math.min(1, save.wildWins / 8);
    case "mines":
      return Math.min(1, 0.2 + save.wildWins * 0.08);
    case "ruins":
      return Math.min(1, 0.15 + save.wildWins * 0.07);
    case "dock":
      return 0.35 + Math.min(0.4, save.fortLevel * 0.08);
    case "haven":
      return Math.min(1, haven / 5);
  }
}

export function mixLandColor(t: number): string {
  const stops = [
    [203, 185, 146],
    [127, 160, 94],
    [53, 84, 63],
  ];
  const x = Math.max(0, Math.min(1, t));
  const scaled = x * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = stops[i]!;
  const b = stops[i + 1]!;
  const r = Math.round(a[0]! + (b[0]! - a[0]!) * f);
  const g = Math.round(a[1]! + (b[1]! - a[1]!) * f);
  const bl = Math.round(a[2]! + (b[2]! - a[2]!) * f);
  return `rgb(${r} ${g} ${bl})`;
}

export function metricLabel(value: number, metric: MetricId): string {
  const pct = Math.round(value * 100);
  if (metric === "care") return `${pct}% cared for`;
  if (metric === "bloom") return `${pct}% in bloom`;
  return `${pct}% built up`;
}

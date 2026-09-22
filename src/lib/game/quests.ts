import type { SkillId } from "./xp";
import { QUEST_POOL } from "./data/quests";

export type QuestStage = "active" | "ready" | "done";

export type QuestSave = {
  id: string;
  stage: QuestStage;
};

export type QuestDef = {
  id: string;
  title: string;
  giver: string;
  offer: string;
  hint: string;
  done: string;
  coins: number;
  xp: Partial<Record<SkillId, number>>;
};

export { QUEST_POOL };

export const QUEST_BY_ID: Record<string, QuestDef> = Object.fromEntries(
  QUEST_POOL.map((q) => [q.id, q]),
);

export function pickStartingQuests() {
  const chicken = QUEST_POOL.find((q) => q.id === "lost-chicken")!;
  const rest = QUEST_POOL.filter((q) => q.id !== "lost-chicken");
  const extra = rest[Math.floor(Math.random() * rest.length)]!;
  return [chicken, extra].map((q) => ({ id: q.id, stage: "active" as const }));
}

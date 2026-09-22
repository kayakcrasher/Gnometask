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
  return [
    { id: "pappy-timber", stage: "active" as const },
    { id: "pappy-expand", stage: "active" as const },
    { id: "lost-chicken", stage: "active" as const },
  ];
}

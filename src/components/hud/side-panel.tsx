import { X } from "lucide-react";
import { localDate } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import { TaskList } from "./task-list";

export function ChoresDrawer() {
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const tasks = useGame((s) => s.tasks);
  const today = localDate();
  const remaining = tasks.filter((t) => {
    if (t.builtin) return t.createdOn === today && !t.done;
    return !t.done;
  }).length;

  if (panel !== "chores") return null;

  return (
    <div className="absolute inset-0 z-30" onClick={() => setPanel("place")}>
      <div
        className="absolute inset-x-3 bottom-3 mx-auto flex max-h-[70dvh] w-full max-w-md flex-col rounded-[24px] bg-parchment p-4 shadow-panel md:inset-x-auto md:bottom-6 md:right-4 md:top-24 md:max-h-[min(32rem,calc(100dvh-7.5rem))] md:w-[22rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <h2 className="min-w-0 flex-1 font-display text-xl font-semibold leading-none text-ink">
            Today's chores
            <span className="ml-2 font-sans text-sm font-semibold text-bark/60">
              {remaining === 0 ? "all done" : `${remaining} left`}
            </span>
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setPanel("place")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <TaskList />
        </div>
      </div>
    </div>
  );
}

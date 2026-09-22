import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { localDate } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import { PLACES } from "@/lib/game/types";

export function TaskList() {
  const tasks = useGame((s) => s.tasks);
  const selectedPlace = useGame((s) => s.selectedPlace);
  const toggleTask = useGame((s) => s.toggleTask);
  const deleteTask = useGame((s) => s.deleteTask);
  const addTask = useGame((s) => s.addTask);
  const [draft, setDraft] = useState("");
  const today = localDate();

  const visible = tasks.filter((t) => {
    if (t.builtin) return t.createdOn === today;
    return !t.done || t.doneOn === today;
  });
  const open = visible.filter((t) => !t.done);
  const done = visible.filter((t) => t.done);

  const grouped = PLACES.map((place) => ({
    place,
    items: open.filter((t) => t.location === place.id),
  })).filter((g) => g.items.length);

  if (selectedPlace) {
    grouped.sort((a, b) => {
      if (a.place.id === selectedPlace) return -1;
      if (b.place.id === selectedPlace) return 1;
      return 0;
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addTask(draft, selectedPlace ?? "cottage");
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={80}
          placeholder="Add a work…"
          className="h-10 min-w-0 flex-1 rounded-[12px] bg-parchment-dark/60 px-3 text-sm font-semibold text-ink outline-none ring-gold/0 transition-[box-shadow] duration-150 placeholder:text-bark/50 focus:ring-2 focus:ring-gold"
          suppressHydrationWarning
        />
        <button
          type="submit"
          aria-label="Add task"
          className="flex size-10 items-center justify-center rounded-[12px] bg-gold text-ink transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          <Plus className="size-5" strokeWidth={2.6} />
        </button>
      </form>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {grouped.length === 0 && done.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-bark/60">
            Nothing on the list. Raise a wall, or enjoy the quiet.
          </p>
        ) : null}

        {grouped.map((group) => (
          <section key={group.place.id}>
            <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bark/50">
              {group.place.name}
            </p>
            <ul className="flex flex-col gap-1.5">
              {group.items.map((task) => (
                <TaskRow
                  key={task.id}
                  text={task.text}
                  done={false}
                  builtin={task.builtin}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={task.builtin ? undefined : () => deleteTask(task.id)}
                />
              ))}
            </ul>
          </section>
        ))}

        {done.length > 0 ? (
          <section>
            <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bark/40">Done</p>
            <ul className="flex flex-col gap-1.5">
              {done.map((task) => (
                <TaskRow
                  key={task.id}
                  text={task.text}
                  done
                  builtin={task.builtin}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={task.builtin ? undefined : () => deleteTask(task.id)}
                />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function TaskRow({
  text,
  done,
  builtin,
  onToggle,
  onDelete,
}: {
  text: string;
  done: boolean;
  builtin: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-2 rounded-[14px] bg-parchment px-2 py-1.5 shadow-[0_0_0_1px_rgba(91,66,48,0.08)]",
          done && "opacity-50",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left"
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-[7px] border-2 border-moss",
              done && "bg-moss",
            )}
          >
            <Check className={cn("size-3.5 text-parchment", done ? "opacity-100" : "opacity-0")} strokeWidth={3} />
          </span>
          <span className={cn("text-sm font-bold leading-snug text-ink", done && "line-through decoration-bark/40")}>
            {text}
          </span>
        </button>
        {builtin ? null : (
          <button
            type="button"
            aria-label="Delete task"
            onClick={onDelete}
            className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-bark/50 hover:text-berry"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </li>
  );
}

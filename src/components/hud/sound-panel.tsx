import { Music2, Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/game/audio/settings";
import { MUSIC, THEMES } from "@/lib/game/audio/score";
import { unlockAudio } from "@/lib/game/juice";
export function SoundPanel() {
  const s = useSound();
  return (
    <section
      aria-label="Music and sound"
      className="mb-4 rounded-2xl bg-[#e5ddc6] p-3 text-ink"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-full bg-pine text-parchment">
          <Music2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold">
            The little music box
          </h3>
          <p className="text-[11px] text-bark">{THEMES.length} original island themes</p>
        </div>
        <button
          type="button"
          aria-label={s.muted ? "Unmute all sound" : "Mute all sound"}
          aria-pressed={s.muted}
          onClick={() => {
            unlockAudio();
            s.setSound({ muted: !s.muted });
          }}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-parchment"
        >
          {s.muted ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </button>
      </div>
      <label className="mt-3 block text-xs font-bold">
        Choose music
        <select
          aria-label="Music selection"
          value={s.selection}
          onChange={(e) => {
            unlockAudio();
            s.setSound({ selection: e.target.value as typeof s.selection });
          }}
          className="mt-1 min-h-11 w-full rounded-xl bg-parchment px-2 text-xs"
        >
          <option value="auto">Follow my surroundings</option>
          {THEMES.map((id) => (
            <option key={id} value={id}>
              {MUSIC[id].title}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs font-semibold">
        {s.muted ? "The music box is resting." : `♪ ${MUSIC[s.playing].title}`}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-bark">
        {MUSIC[s.playing].description}
      </p>
      <div className="mt-3 space-y-2">
        {(["music", "ambience", "effects"] as const).map((id) => (
          <label key={id} className="block text-xs font-bold">
            <span className="flex justify-between">
              <span>
                {id === "music"
                  ? "Music"
                  : id === "ambience"
                    ? "Nature ambience"
                    : "Sound effects"}
              </span>
              <span>{Math.round(s[id] * 100)}%</span>
            </span>
            <input
              aria-label={`${id} volume`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(s[id] * 100)}
              onChange={(e) => {
                unlockAudio();
                s.setSound({ [id]: Number(e.target.value) / 100 });
              }}
              className="h-11 w-full accent-[#426b51]"
            />
          </label>
        ))}
      </div>
      {!s.available ? (
        <p role="status" className="text-xs">
          Audio is unavailable in this browser. The game still works normally.
        </p>
      ) : !s.unlocked ? (
        <button
          type="button"
          onClick={unlockAudio}
          className="mt-1 min-h-11 w-full rounded-xl bg-pine text-xs font-bold text-parchment"
        >
          Open the music box
        </button>
      ) : null}
      <p className="mt-1 text-[10px] leading-relaxed text-bark">
        Gentle fades, no sudden battle drums. Sound pauses when you switch away
        from the game. Your choices are remembered.
      </p>
    </section>
  );
}

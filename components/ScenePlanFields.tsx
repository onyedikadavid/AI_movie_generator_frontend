"use client";

const box =
  "w-full rounded-card border border-ink-border bg-ink-surface px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:border-tally focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

/** Optional numbers: leave a box empty for "automatic". Values are kept as text so the box can be cleared. */
export function ScenePlanFields({
  sceneCount,
  onSceneCount,
  sceneSeconds,
  onSceneSeconds,
  secondsPlaceholder = "Auto",
  hideCount,
  disabled,
}: {
  sceneCount: string;
  onSceneCount: (v: string) => void;
  sceneSeconds: string;
  onSceneSeconds: (v: string) => void;
  secondsPlaceholder?: string;
  hideCount?: boolean;
  disabled?: boolean;
}) {
  const digits = (v: string) => v.replace(/[^0-9]/g, "").slice(0, 2);
  return (
    <div className={`grid grid-cols-1 gap-3 ${hideCount ? "" : "sm:grid-cols-2"}`}>
      {!hideCount && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-paper">Number of scenes</span>
          <input
            inputMode="numeric"
            value={sceneCount}
            onChange={(e) => onSceneCount(digits(e.target.value))}
            placeholder="Auto"
            disabled={disabled}
            className={box}
          />
          <span className="mt-1 block text-xs text-paper-faint">Leave empty and the script writer picks the number the story needs.</span>
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-paper">Seconds per scene</span>
        <input
          inputMode="numeric"
          value={sceneSeconds}
          onChange={(e) => onSceneSeconds(digits(e.target.value))}
          placeholder={secondsPlaceholder}
          disabled={disabled}
          className={box}
        />
        <span className="mt-1 block text-xs text-paper-faint">
          3 to 30. Each scene is made as one clip this long. Your video server also has its own maximum, and longer scenes take much longer to generate.
        </span>
      </label>
    </div>
  );
}

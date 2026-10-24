"use client";

export const RESOLUTION_OPTIONS: { value: string; title: string; blurb: string }[] = [
  { value: "512x288", title: "Draft", blurb: "512×288 · fastest, soft picture. Good for testing a story." },
  { value: "640x352", title: "Fast", blurb: "640×352 · much quicker than High, still watchable." },
  { value: "768x448", title: "Balanced", blurb: "768×448 · a middle ground." },
  { value: "960x544", title: "High", blurb: "960×544 · best picture, slowest." },
];

/** Smaller video = a lot less GPU time. The finished film is still scaled to the normal output size. */
export function ResolutionPicker({
  value,
  onChange,
  disabled,
  busy,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Video quality" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {RESOLUTION_OPTIONS.map(({ value: v, title, blurb }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || busy}
            onClick={() => !selected && onChange(v)}
            className={`flex flex-col gap-1 rounded-card border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selected ? "border-tally bg-tally/10" : "border-ink-border bg-ink-surface hover:border-paper-faint"
            }`}
          >
            <span className={`text-sm font-medium ${selected ? "text-tally" : "text-paper"}`}>{title}</span>
            <span className="text-xs text-paper-faint">{blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

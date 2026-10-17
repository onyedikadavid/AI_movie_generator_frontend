"use client";

import { Mic, MicOff } from "lucide-react";

/** On/off switch for the narrator's voice-over. Characters always speak their own lines either way. */
export function NarratorToggle({
  value,
  onChange,
  disabled,
  busy,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label="Narrator voice-over"
      disabled={disabled || busy}
      onClick={() => onChange(!value)}
      className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
        value ? "border-tally bg-tally/10" : "border-ink-border bg-ink-surface hover:border-paper-faint"
      }`}
    >
      {value ? <Mic className="h-4 w-4 text-tally" /> : <MicOff className="h-4 w-4 text-paper-muted" />}
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={`text-sm font-medium ${value ? "text-tally" : "text-paper"}`}>
          Narrator voice-over: {value ? "On" : "Off"}
        </span>
        <span className="text-xs text-paper-muted">
          {value
            ? "A narrator adds a short spoken line to each scene, besides the characters' own lines."
            : "Only the characters speak. No narrator voice at all."}
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${value ? "bg-tally" : "bg-ink-border"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

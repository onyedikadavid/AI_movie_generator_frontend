"use client";

import { FileText, Zap } from "lucide-react";
import type { GenerationMode } from "@/lib/types";

const OPTIONS: { value: GenerationMode; title: string; blurb: string; Icon: typeof Zap }[] = [
  {
    value: "script",
    title: "Write a script first",
    blurb: "The writer model turns your idea into scenes, cast and dialogue. You review it, then generate.",
    Icon: FileText,
  },
  {
    value: "direct",
    title: "Straight to video",
    blurb: "No script and no writer model. Your idea goes directly to the video model and starts generating right away.",
    Icon: Zap,
  },
];

export function GenerationModePicker({
  value,
  onChange,
  disabled,
}: {
  value: GenerationMode;
  onChange: (v: GenerationMode) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="How to make the video" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {OPTIONS.map(({ value: v, title, blurb, Icon }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(v)}
            className={`flex flex-col gap-1 rounded-card border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selected ? "border-tally bg-tally/10" : "border-ink-border bg-ink-surface hover:border-paper-faint"
            }`}
          >
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${selected ? "text-tally" : "text-paper"}`}>
              <Icon className="h-4 w-4" /> {title}
            </span>
            <span className="text-xs text-paper-muted">{blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

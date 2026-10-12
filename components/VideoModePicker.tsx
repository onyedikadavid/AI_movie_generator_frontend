"use client";

import { Film, ImageIcon } from "lucide-react";
import type { VideoMode } from "@/lib/types";

export const VIDEO_MODE_OPTIONS: { value: VideoMode; title: string; blurb: string; Icon: typeof Film }[] = [
  {
    value: "i2v",
    title: "Image first",
    blurb: "The image model draws a keyframe for each scene, then the video model animates it. Best for keeping faces and looks consistent.",
    Icon: ImageIcon,
  },
  {
    value: "t2v",
    title: "Text to video",
    blurb: "No image model: the video model builds each shot straight from the text. Faster, and the camera is freer, but looks can drift between shots.",
    Icon: Film,
  },
];

export function VideoModePicker({
  value,
  onChange,
  disabled,
  busy,
}: {
  value: VideoMode;
  onChange: (v: VideoMode) => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="How scenes are generated" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {VIDEO_MODE_OPTIONS.map(({ value: v, title, blurb, Icon }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || busy}
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

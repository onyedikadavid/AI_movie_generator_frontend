"use client";

import { useState } from "react";
import { BookOpen, Check, Copy } from "lucide-react";
import type { ScriptResponse } from "@/lib/types";

const OUTLINE_LABELS: [string, string][] = [
  ["logline", "In one line"],
  ["main_character", "Who we follow"],
  ["problem", "The problem"],
  ["turning_point", "Turning point"],
  ["ending", "Ending"],
  ["message", "Meaning"],
];

/** The full story the script writer built from the idea: hook first, clear beginning, middle and end. */
export function StoryCard({ script, title }: { script: ScriptResponse | null; title?: string | null }) {
  const [copied, setCopied] = useState(false);
  const story = script?.story_text?.trim();
  if (!script || !story) {
    return (
      <section>
        <h2 className="font-display text-lg text-paper">The story</h2>
        <p className="mt-1 text-sm text-paper-muted">
          No full story was saved for this project. Projects created with the newest version get one - create a new project to see it.
        </p>
      </section>
    );
  }
  const outline = (script.story_outline ?? {}) as Record<string, string>;
  const paragraphs = story.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title ? title + "\n\n" : ""}${story}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available - nothing to do */
    }
  }

  return (
    <section className="rounded-card border border-ink-border bg-ink-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg text-paper">
          <BookOpen className="h-4 w-4 text-tally" /> The story
        </h2>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-xs text-paper-muted hover:text-paper">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {script.story_hook && (
        <p className="mt-3 rounded-card border border-tally/40 bg-tally/10 px-3 py-2 text-sm text-tally">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-wide">Hook</span>
          {script.story_hook}
        </p>
      )}

      <div className="mt-3 space-y-3 text-sm leading-relaxed text-paper">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {OUTLINE_LABELS.some(([k]) => outline[k]) && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-paper-muted hover:text-paper">Story structure</summary>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[9rem_1fr]">
            {OUTLINE_LABELS.filter(([k]) => outline[k]).map(([k, label]) => (
              <div key={k} className="contents">
                <dt className="text-xs text-paper-faint">{label}</dt>
                <dd className="text-paper-muted">{outline[k]}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}

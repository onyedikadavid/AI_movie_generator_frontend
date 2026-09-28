"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Some backend error messages are a single short sentence; others (an
 * ffmpeg failure, a stack trace) can run to thousands of characters full of
 * file paths and internal detail. Dumping either straight onto the page
 * either looks fine or looks like a wall of red text with no way to look
 * away from it. This shows a short first line always, and puts everything
 * else behind an explicit "show details" toggle.
 */
function summarize(message: string): { summary: string; hasMore: boolean } {
  const firstLine = message.split("\n")[0].trim();
  const summary = firstLine.length > 140 ? `${firstLine.slice(0, 140)}…` : firstLine;
  const hasMore = message.trim().length > summary.replace("…", "").length;
  return { summary: summary || "Something went wrong.", hasMore };
}

export function ErrorDetails({ message, className = "" }: { message: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const { summary, hasMore } = summarize(message);

  return (
    <div className={className}>
      <p className="text-sm">{summary}</p>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 flex items-center gap-1 text-xs text-paper-muted transition hover:text-paper"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {expanded ? "Hide" : "Show"} technical details
        </button>
      )}
      {expanded && (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-xs leading-relaxed text-paper-muted">
          {message}
        </pre>
      )}
    </div>
  );
}

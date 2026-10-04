"use client";

import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { describeRun } from "@/lib/runState";
import type { QueueSnapshot } from "@/lib/types";

/** "Now running" + the line of projects waiting - so there's never any doubt which one is actually working. */
export function QueuePanel({ queue }: { queue: QueueSnapshot | null }) {
  if (!queue) return null;
  const { running, queued } = queue;
  if (!running && queued.length === 0) return null;

  const view = running ? describeRun({ ...running, resume_count: 0, queue_position: null }) : null;
  const silent = running?.heartbeat_age_seconds ?? 0;
  const workerQuiet = !!running && silent > 30;
  const nobodyRunning = !running && queued.length > 0 && (queue.oldest_queued_age_seconds ?? 0) > 45;

  return (
    <div className="rounded-card border border-ink-border bg-ink-surface p-4">
      {running ? (
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-reel" />
              <span className="text-xs uppercase tracking-wide text-paper-faint">Now running</span>
              <Link href={`/projects/${running.id}/player`} className="truncate font-display text-base text-paper hover:text-tally">
                {running.title}
              </Link>
            </div>
            <span className="shrink-0 font-mono text-xs text-reel">{running.progress_pct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-raised">
            <div className="h-full rounded-full bg-reel transition-all duration-700" style={{ width: `${Math.min(100, running.progress_pct)}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-paper-muted">
            {view && view.stopping ? view.label : running.stage_detail || "Working…"}
          </p>
          {workerQuiet && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-tally">
              <AlertTriangle className="h-3.5 w-3.5" /> No signal from the worker for {Math.round(silent)}s - it may have stopped or be busy on a long GPU step.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-paper-muted">Nothing is running right now.</p>
      )}

      {nobodyRunning && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-tally">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {queued.length} project{queued.length === 1 ? " is" : "s are"} waiting but no worker has picked {queued.length === 1 ? "it" : "them"} up. Check that your Celery worker is running.
        </p>
      )}

      {queued.length > 0 && (
        <div className="mt-3 border-t border-ink-border pt-3">
          <p className="text-xs uppercase tracking-wide text-paper-faint">Waiting in line</p>
          <ol className="mt-1.5 space-y-1">
            {queued.map((q) => (
              <li key={q.id} className="flex items-center gap-2 text-sm">
                <span className="w-6 font-mono text-xs text-paper-faint">#{q.position}</span>
                <Link href={`/projects/${q.id}/player`} className="truncate text-paper-muted hover:text-tally">
                  {q.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

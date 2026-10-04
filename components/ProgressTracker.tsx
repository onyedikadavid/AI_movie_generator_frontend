import { AlertCircle, Check, Clock, Loader2, Pause } from "lucide-react";
import { describeRun } from "@/lib/runState";
import type { ProjectDetail } from "@/lib/types";

/**
 * Scene-by-scene progress: one chip per scene (done / rendering now / waiting /
 * failed) plus the final cut, an overall bar, and what the worker is doing this second.
 */
export function ProgressTracker({ project }: { project: ProjectDetail }) {
  const view = describeRun(project);
  const scenes = project.scenes;
  const done = scenes.filter((s) => s.render_status === "DONE").length;
  const compositing = project.status === "COMPOSITING";
  const finished = project.status === "COMPLETED";
  const paused = project.status === "PAUSED";

  const place = project.queue_position
    ? project.queue_position === 1
      ? "next up"
      : `#${project.queue_position} in line`
    : "waiting";
  const headline = view.waiting
    ? `Waiting for its turn (${place}) - only one project renders at a time`
    : paused
    ? `Paused - ${done} of ${scenes.length} scenes finished and saved`
    : project.stage_detail || "Working…";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {scenes.map((s) => {
          const isDone = s.render_status === "DONE" || finished;
          const isRendering = s.render_status === "RENDERING" && view.running;
          const isFailed = s.render_status === "FAILED";
          return (
            <div
              key={s.id}
              title={`Scene ${s.scene_number}${s.location ? ` - ${s.location}` : ""}`}
              className={`flex h-8 min-w-[2.25rem] items-center justify-center gap-1 rounded-md border px-2 font-mono text-xs ${
                isDone
                  ? "border-wrap/50 bg-wrap/15 text-wrap"
                  : isFailed
                  ? "border-cut/50 bg-cut/10 text-cut"
                  : isRendering
                  ? "border-reel bg-reel/15 text-reel"
                  : "border-ink-border bg-ink text-paper-faint"
              }`}
            >
              {isDone ? <Check className="h-3 w-3" /> : isRendering ? <Loader2 className="h-3 w-3 animate-spin" /> : isFailed ? <AlertCircle className="h-3 w-3" /> : null}
              {String(s.scene_number).padStart(2, "0")}
            </div>
          );
        })}
        <div
          className={`flex h-8 items-center gap-1 rounded-md border px-2 text-xs ${
            finished
              ? "border-wrap/50 bg-wrap/15 text-wrap"
              : compositing
              ? "border-reel bg-reel/15 text-reel"
              : "border-ink-border bg-ink text-paper-faint"
          }`}
        >
          {finished ? <Check className="h-3 w-3" /> : compositing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Final cut
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-paper-muted">
            {view.waiting ? <Clock className="h-3.5 w-3.5" /> : paused ? <Pause className="h-3.5 w-3.5 text-tally" /> : view.running ? <Loader2 className="h-3.5 w-3.5 animate-spin text-reel" /> : null}
            {headline}
          </span>
          <span className="font-mono text-paper-faint">{project.progress_pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-raised">
          <div
            className={`h-full rounded-full transition-all duration-700 ${paused ? "bg-tally" : view.waiting ? "bg-paper-faint" : "bg-reel"}`}
            style={{ width: `${Math.min(100, Math.max(project.progress_pct, view.waiting ? 0 : 2))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

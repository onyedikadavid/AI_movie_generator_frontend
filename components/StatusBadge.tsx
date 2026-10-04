import { describeRun, TONE_CLASSES } from "@/lib/runState";
import type { RunState } from "@/lib/types";

type Like = Pick<
  RunState,
  "status" | "pause_requested" | "cancel_requested" | "delete_requested" | "resume_count" | "queue_position" | "current_scene" | "total_scenes"
>;

/** Honest, live status for a project: Queued #n / Generating / Pausing… / Paused / Resuming / Cancelled / Deleting… */
export function StatusBadge({ project }: { project: Like }) {
  const view = describeRun(project);
  const tone = TONE_CLASSES[view.tone];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot} ${view.pulsing ? "animate-pulse-dot" : ""}`} />
      {view.label}
    </span>
  );
}

/** Left color bar used on project cards - encodes status without another pill. */
export function statusBarColor(project: Like): string {
  return TONE_CLASSES[describeRun(project).tone].bar;
}

import { ACTIVE_STATUSES, STATUS_LABELS, WAITING_STATUSES } from "./types";
import type { RunState } from "./types";

export type Tone = "done" | "failed" | "paused" | "ready" | "working" | "waiting" | "stopping" | "idle";

export interface RunView {
  /** Short text for badges, e.g. "Paused", "Queued · #2 in line", "Resuming…". */
  label: string;
  tone: Tone;
  pulsing: boolean;
  /** Worker is really executing it. */
  running: boolean;
  /** Waiting for its turn. */
  waiting: boolean;
  /** A stop/delete was requested and hasn't finished yet. */
  stopping: boolean;
  /** Can't be edited right now (running, waiting or stopping). */
  busy: boolean;
  canPause: boolean;
  canResume: boolean;
  canStop: boolean;
}

type Like = Pick<
  RunState,
  "status" | "pause_requested" | "cancel_requested" | "delete_requested" | "resume_count" | "queue_position" | "current_scene" | "total_scenes"
>;

export function describeRun(p: Like): RunView {
  const active = ACTIVE_STATUSES.includes(p.status);
  const waiting = WAITING_STATUSES.includes(p.status);
  const resumed = (p.resume_count || 0) > 0;

  let label: string;
  let tone: Tone;

  if (p.delete_requested) {
    label = "Deleting…";
    tone = "stopping";
  } else if (p.cancel_requested) {
    label = "Cancelling…";
    tone = "stopping";
  } else if (p.pause_requested) {
    label = "Pausing…";
    tone = "stopping";
  } else if (waiting) {
    const where = p.queue_position ? (p.queue_position === 1 ? " · next up" : ` · #${p.queue_position} in line`) : "";
    label = `${resumed ? "Resuming" : "Queued"}${where}`;
    tone = "waiting";
  } else if (active) {
    const scene = p.current_scene && p.total_scenes ? ` · scene ${p.current_scene}/${p.total_scenes}` : "";
    label = `${STATUS_LABELS[p.status]}${scene}${resumed ? " (resumed)" : ""}`;
    tone = "working";
  } else {
    label = STATUS_LABELS[p.status];
    tone =
      p.status === "COMPLETED" ? "done"
      : p.status === "FAILED" ? "failed"
      : p.status === "PAUSED" ? "paused"
      : p.status === "SCRIPT_READY" ? "ready"
      : "idle";
  }

  const stopping = p.pause_requested || p.cancel_requested || p.delete_requested;
  const busy = active || waiting || stopping;
  return {
    label,
    tone,
    pulsing: (active || waiting || stopping) && tone !== "paused",
    running: active,
    waiting,
    stopping,
    busy,
    canPause: (active || waiting) && !stopping,
    canResume: ["PAUSED", "FAILED", "CANCELLED"].includes(p.status) && !stopping,
    canStop: (active || waiting || p.status === "PAUSED") && !stopping,
  };
}

export const TONE_CLASSES: Record<Tone, { dot: string; text: string; bar: string }> = {
  done: { dot: "bg-wrap", text: "text-wrap", bar: "bg-wrap" },
  failed: { dot: "bg-cut", text: "text-cut", bar: "bg-cut" },
  paused: { dot: "bg-tally", text: "text-tally", bar: "bg-tally" },
  ready: { dot: "bg-tally", text: "text-tally", bar: "bg-tally" },
  working: { dot: "bg-reel", text: "text-reel", bar: "bg-reel" },
  waiting: { dot: "bg-paper-muted", text: "text-paper-muted", bar: "bg-paper-faint" },
  stopping: { dot: "bg-cut", text: "text-cut", bar: "bg-cut" },
  idle: { dot: "bg-paper-faint", text: "text-paper-muted", bar: "bg-ink-border" },
};

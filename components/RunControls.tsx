"use client";

import { useState } from "react";
import { Pause, Play, Square, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { describeRun } from "@/lib/runState";
import type { RunState } from "@/lib/types";
import { Button } from "./Button";

type Action = "pause" | "resume" | "stop" | "delete";

/**
 * Pause / Resume / Stop / Delete for one project, enabled only when they make
 * sense for its current state. `compact` renders small icon buttons for cards.
 */
export function RunControls({
  project,
  onChanged,
  onDeleted,
  compact = false,
  hideResume = false,
}: {
  project: Pick<RunState, "status" | "pause_requested" | "cancel_requested" | "delete_requested" | "resume_count" | "queue_position" | "current_scene" | "total_scenes"> & {
    id: string;
    title: string | null;
  };
  onChanged: () => void | Promise<void>;
  onDeleted?: () => void;
  compact?: boolean;
  hideResume?: boolean;
}) {
  const view = describeRun(project);
  const [pending, setPending] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    const name = project.title || "this project";
    if (action === "stop" && !window.confirm(`Stop "${name}"? Finished scenes are kept, so you can resume it later.`)) return;
    if (
      action === "delete" &&
      !window.confirm(
        view.running
          ? `Delete "${name}"? It is running right now - it will be stopped and everything will be removed. This can't be undone.`
          : `Delete "${name}" and everything generated for it? This can't be undone.`
      )
    )
      return;

    setPending(action);
    setError(null);
    try {
      if (action === "pause") await api.pauseProject(project.id);
      else if (action === "resume") await api.resumeProject(project.id);
      else if (action === "stop") await api.cancelProject(project.id);
      else {
        const res = await api.deleteProject(project.id);
        if (res.deleted) {
          onDeleted?.();
          return;
        }
      }
      await onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "That didn't work - please try again.");
    } finally {
      setPending(null);
    }
  }

  const showPause = view.canPause;
  const showResume = view.canResume && !hideResume;
  const showStop = view.canStop;
  const showDelete = !project.delete_requested;

  if (compact) {
    const iconBtn =
      "inline-flex h-7 w-7 items-center justify-center rounded-md text-paper-faint transition-colors hover:bg-ink-raised disabled:opacity-40";
    return (
      <div className="flex items-center gap-0.5">
        {showPause && (
          <button className={`${iconBtn} hover:text-tally`} title="Pause" aria-label="Pause" disabled={pending !== null} onClick={() => run("pause")}>
            <Pause className="h-3.5 w-3.5" />
          </button>
        )}
        {showResume && (
          <button className={`${iconBtn} hover:text-wrap`} title="Resume" aria-label="Resume" disabled={pending !== null} onClick={() => run("resume")}>
            <Play className="h-3.5 w-3.5" />
          </button>
        )}
        {showStop && (
          <button className={`${iconBtn} hover:text-cut`} title="Stop" aria-label="Stop" disabled={pending !== null} onClick={() => run("stop")}>
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
        {showDelete && (
          <button className={`${iconBtn} hover:text-cut`} title="Delete" aria-label="Delete" disabled={pending !== null} onClick={() => run("delete")}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        {error && <span className="ml-1 max-w-[10rem] truncate text-[11px] text-cut" title={error}>{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showPause && (
        <Button variant="secondary" onClick={() => run("pause")} loading={pending === "pause"} disabled={pending !== null}>
          <Pause className="h-3.5 w-3.5" /> Pause
        </Button>
      )}
      {showResume && (
        <Button onClick={() => run("resume")} loading={pending === "resume"} disabled={pending !== null}>
          <Play className="h-3.5 w-3.5" /> Resume
        </Button>
      )}
      {showStop && (
        <Button variant="ghost" onClick={() => run("stop")} loading={pending === "stop"} disabled={pending !== null}>
          <Square className="h-3.5 w-3.5" /> Stop
        </Button>
      )}
      {showDelete && (
        <Button variant="danger" onClick={() => run("delete")} loading={pending === "delete"} disabled={pending !== null}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      )}
      {error && <p className="w-full text-xs text-cut">{error}</p>}
    </div>
  );
}

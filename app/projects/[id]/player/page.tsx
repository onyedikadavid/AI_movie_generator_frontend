"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Pencil, RotateCcw } from "lucide-react";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { mediaUrl, api, ApiError } from "@/lib/api";
import { describeRun } from "@/lib/runState";
import { ProgressTracker } from "@/components/ProgressTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { RunControls } from "@/components/RunControls";
import { ErrorDetails } from "@/components/ErrorDetails";

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project, loading, error, gone, refresh } = useProjectPolling(params.id, 3000);
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState<string | null>(null);

  useEffect(() => {
    if (gone) router.replace("/");
  }, [gone, router]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-24 text-paper-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading project…
      </div>
    );
  }

  if (gone) {
    return <div className="py-24 text-center text-sm text-paper-muted">This project was deleted. Taking you back…</div>;
  }

  if (error || !project) {
    return (
      <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
        {error || "Project not found."}
      </div>
    );
  }

  const view = describeRun(project);
  const videoUrl = mediaUrl(project.final_video_path);
  const showProgress = view.busy || project.status === "PAUSED";
  const hasScenes = project.scenes.length > 0;
  const doneScenes = project.scenes.filter((s) => s.render_status === "DONE").length;

  async function startOver() {
    if (!window.confirm("Redo every scene from scratch? Everything already rendered will be replaced.")) return;
    setRestarting(true);
    setRestartError(null);
    try {
      await api.runPipeline(project!.id, true);
      await refresh();
    } catch (e) {
      setRestartError(e instanceof ApiError ? e.message : "Couldn't restart generation.");
    } finally {
      setRestarting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">{project.title || "Untitled project"}</h1>
          <div className="mt-2">
            <StatusBadge project={project} />
          </div>
        </div>
        <button
          onClick={() => router.push(`/projects/${project.id}/edit`)}
          className="inline-flex items-center gap-1.5 text-sm text-paper-muted hover:text-tally"
        >
          <Pencil className="h-3.5 w-3.5" /> Back to shot list
        </button>
      </div>

      {view.stopping && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
          {project.delete_requested
            ? "Deleting - stopping the current step first. This page will close when it's gone."
            : project.cancel_requested
            ? "Cancelling - finishing the current step. This usually takes a few seconds."
            : "Pausing - finishing the current step so nothing is lost. This usually takes a few seconds."}
        </div>
      )}

      {showProgress && (
        <div className="rounded-card border border-ink-border bg-ink-surface p-6">
          {hasScenes ? (
            <ProgressTracker project={project} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-paper-muted">
              {view.running && <Loader2 className="h-4 w-4 animate-spin text-reel" />}
              {view.waiting ? "Waiting for its turn…" : project.status === "PAUSED" ? "Script writing is paused." : project.stage_detail || "Writing the script…"}
            </p>
          )}
          <div className="mt-5 border-t border-ink-border pt-4">
            <RunControls project={project} onChanged={refresh} onDeleted={() => router.replace("/")} />
          </div>
        </div>
      )}

      {project.warning_message && (
        <div className="flex items-start gap-2 rounded-card border border-tally/40 bg-tally/10 px-4 py-3 text-sm text-tally">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{project.warning_message}</span>
        </div>
      )}

      {project.status === "CANCELLED" && (
        <div className="rounded-card border border-ink-border bg-ink-surface p-5">
          <p className="text-sm text-paper-muted">
            Generation was stopped. {hasScenes ? `${doneScenes} of ${project.scenes.length} scenes are finished and saved.` : ""}
          </p>
          {restartError && <p className="mt-1 text-xs text-cut">{restartError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <RunControls project={project} onChanged={refresh} onDeleted={() => router.replace("/")} />
            {hasScenes && (
              <Button variant="secondary" onClick={startOver} loading={restarting}>
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </Button>
            )}
          </div>
        </div>
      )}

      {project.status === "FAILED" && (
        <div className="rounded-card border border-cut/40 bg-cut/10 p-5 text-cut">
          <p className="text-sm font-medium">Generation stopped with an error{hasScenes ? ` - ${doneScenes} of ${project.scenes.length} scenes are saved` : ""}</p>
          <ErrorDetails message={project.error_message || "Unknown error."} className="mt-1" />
          {restartError && <p className="mt-2 text-xs">{restartError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <RunControls project={project} onChanged={refresh} onDeleted={() => router.replace("/")} />
            {hasScenes && (
              <Button variant="secondary" onClick={startOver} loading={restarting}>
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </Button>
            )}
          </div>
        </div>
      )}

      {videoUrl ? (
        <div className="overflow-hidden rounded-card border border-ink-border bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={videoUrl} controls className="aspect-video w-full bg-black" />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-card border border-ink-border bg-ink-surface text-sm text-paper-faint">
          {project.status === "COMPLETED" ? "Video file not found on disk." : "Final cut will appear here once it's finished."}
        </div>
      )}

      {project.status === "COMPLETED" && (
        <div className="-mt-4 flex justify-end">
          <RunControls project={project} onChanged={refresh} onDeleted={() => router.replace("/")} />
        </div>
      )}

      <section>
        <h2 className="font-display text-lg text-paper">Scene keyframes</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {project.scenes.map((scene) => {
            const img = mediaUrl(scene.image_path);
            return (
              <div key={scene.id} className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
                <div className="flex aspect-video items-center justify-center bg-ink-raised text-paper-faint">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={`Scene ${scene.scene_number} keyframe`} className="h-full w-full object-cover" />
                  ) : scene.render_status === "RENDERING" && view.running ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-[11px]">not drawn yet</span>
                  )}
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5">
                  <span className="font-mono text-xs text-tally">{String(scene.scene_number).padStart(2, "0")}</span>
                  <span className="truncate text-xs text-paper-faint">{scene.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2, Pencil, RotateCcw } from "lucide-react";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { mediaUrl, api, ApiError } from "@/lib/api";
import { ProgressTracker } from "@/components/ProgressTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { useState } from "react";

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project, loading, error } = useProjectPolling(params.id, 4000);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-24 text-paper-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
        {error || "Project not found."}
      </div>
    );
  }

  const videoUrl = mediaUrl(project.final_video_path);
  const isTerminal = project.status === "COMPLETED" || project.status === "FAILED";

  async function retry() {
    setRetrying(true);
    setRetryError(null);
    try {
      await api.runPipeline(project!.id);
    } catch (e) {
      setRetryError(e instanceof ApiError ? e.message : "Couldn't restart generation.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">{project.title || "Untitled project"}</h1>
          <div className="mt-2">
            <StatusBadge status={project.status} />
          </div>
        </div>
        <button
          onClick={() => router.push(`/projects/${project.id}/edit`)}
          className="inline-flex items-center gap-1.5 text-sm text-paper-muted hover:text-tally"
        >
          <Pencil className="h-3.5 w-3.5" /> Back to shot list
        </button>
      </div>

      {!isTerminal && (
        <div className="rounded-card border border-ink-border bg-ink-surface p-6">
          <ProgressTracker status={project.status} />
        </div>
      )}

      {project.status === "FAILED" && (
        <div className="rounded-card border border-cut/40 bg-cut/10 p-5">
          <p className="text-sm text-cut">Generation failed: {project.error_message || "Unknown error."}</p>
          {retryError && <p className="mt-1 text-xs text-cut">{retryError}</p>}
          <div className="mt-3">
            <Button variant="danger" onClick={retry} loading={retrying}>
              <RotateCcw className="h-3.5 w-3.5" /> Retry generation
            </Button>
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
          {project.status === "COMPLETED" ? "Video file not found on disk." : "Final cut will appear here once compositing finishes."}
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
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
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

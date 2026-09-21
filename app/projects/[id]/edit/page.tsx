"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { api, ApiError } from "@/lib/api";
import { CharacterCard } from "@/components/CharacterCard";
import { SceneRow } from "@/components/SceneRow";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project, loading, error } = useProjectPolling(params.id, 3000);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

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

  const stillWriting = project.status === "CREATED" || project.status === "TRANSCRIBING" || project.status === "GENERATING_SCRIPT";
  const locked =
    project.status !== "SCRIPT_READY" && project.status !== "FAILED" && project.status !== "CANCELLED";
  const canGenerate =
    project.status === "SCRIPT_READY" ||
    project.status === "FAILED" ||
    project.status === "COMPLETED" ||
    project.status === "CANCELLED";

  async function handleStartGeneration() {
    setStarting(true);
    setStartError(null);
    try {
      await api.runPipeline(project!.id);
      router.push(`/projects/${project!.id}/player`);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "Couldn't start generation.");
      setStarting(false);
    }
  }

  if (stillWriting) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-24 text-center">
        <Sparkles className="h-8 w-8 animate-pulse text-tally" />
        <div>
          <p className="font-display text-xl text-paper">Writing your script…</p>
          <p className="mt-1 text-sm text-paper-muted">
            The pipeline is parsing your idea into characters and scenes. This usually takes a moment.
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">{project.title || "Untitled project"}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={project.status} />
            {project.script && (
              <span className="text-xs text-paper-faint">
                {project.script.genre} · {project.script.tone} · {project.script.visual_style}
              </span>
            )}
          </div>
        </div>
        <Button onClick={handleStartGeneration} loading={starting} disabled={!canGenerate}>
          {project.status === "FAILED"
            ? "Retry generation"
            : project.status === "CANCELLED"
              ? "Start generation again"
              : project.status === "COMPLETED"
                ? "Regenerate"
                : "Start generation"}
        </Button>
      </div>

      {project.status === "FAILED" && project.error_message && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
          Last run failed: {project.error_message}
        </div>
      )}

      {project.status === "CANCELLED" && (
        <div className="rounded-card border border-ink-border bg-ink-surface px-4 py-3 text-sm text-paper-muted">
          Generation was stopped before it finished. Review or edit anything below, then start it again when ready.
        </div>
      )}
      {startError && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">{startError}</div>
      )}

      <section>
        <h2 className="font-display text-lg text-paper">Cast</h2>
        <p className="text-sm text-paper-muted">
          These descriptions are reused across every scene to keep each character&apos;s look consistent.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {project.characters.map((c) => (
            <CharacterCard key={c.id} projectId={project.id} character={c} locked={locked} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-paper">Shot list</h2>
        <p className="text-sm text-paper-muted">
          {project.scenes.length} scene{project.scenes.length === 1 ? "" : "s"}, in order. Expand any scene to edit its prompts before rendering.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {project.scenes.map((s) => (
            <SceneRow key={s.id} projectId={project.id} scene={s} locked={locked} />
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Play, RotateCcw, Sparkles, Eye } from "lucide-react";
import { useProjectPolling } from "@/hooks/useProjectPolling";
import { api, ApiError } from "@/lib/api";
import { describeRun } from "@/lib/runState";
import { CharacterCard } from "@/components/CharacterCard";
import { SceneRow } from "@/components/SceneRow";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { RunControls } from "@/components/RunControls";
import { ErrorDetails } from "@/components/ErrorDetails";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project, loading, error, gone, refresh } = useProjectPolling(params.id, 3000);
  const [busyAction, setBusyAction] = useState<"start" | "fresh" | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

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
  const noScript = project.scenes.length === 0;
  const locked = view.busy;
  const resting = ["PAUSED", "FAILED", "CANCELLED"].includes(project.status);

  async function start(fresh: boolean) {
    if (fresh && !window.confirm("Redo every scene from scratch? Everything already rendered for this project will be replaced.")) return;
    setBusyAction(fresh ? "fresh" : "start");
    setStartError(null);
    try {
      await api.runPipeline(project!.id, fresh);
      router.push(`/projects/${project!.id}/player`);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "Couldn't start generation.");
      setBusyAction(null);
    }
  }

  async function resume() {
    setBusyAction("start");
    setStartError(null);
    try {
      await api.resumeProject(project!.id);
      router.push(`/projects/${project!.id}/player`);
    } catch (e) {
      setStartError(e instanceof ApiError ? e.message : "Couldn't resume.");
      setBusyAction(null);
    }
  }

  // ---- No script yet: still writing / queued / paused / failed ----------------
  if (noScript) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <Sparkles className={`h-8 w-8 text-tally ${view.running ? "animate-pulse" : ""}`} />
        <div>
          <p className="font-display text-xl text-paper">
            {project.status === "PAUSED"
              ? "Script writing is paused"
              : project.status === "FAILED"
              ? "The script couldn't be written"
              : project.status === "CANCELLED"
              ? "Script writing was cancelled"
              : view.waiting
              ? "Waiting for its turn…"
              : "Writing your script…"}
          </p>
          <p className="mt-1 text-sm text-paper-muted">
            {view.waiting
              ? "Another production is being processed first; this one starts automatically."
              : resting
              ? "Press Resume to try again."
              : "The pipeline is parsing your idea into characters and scenes. This usually takes a moment."}
          </p>
        </div>
        <StatusBadge project={project} />
        {project.status === "FAILED" && project.error_message && (
          <div className="w-full rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-left text-cut">
            <ErrorDetails message={project.error_message} />
          </div>
        )}
        <RunControls project={project} onChanged={refresh} onDeleted={() => router.replace("/")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper">{project.title || "Untitled project"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge project={project} />
            {project.script && (
              <span className="text-xs text-paper-faint">
                {project.script.genre} · {project.script.tone} · {project.script.visual_style}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {project.status === "SCRIPT_READY" && (
            <Button onClick={() => start(false)} loading={busyAction === "start"}>
              <Play className="h-3.5 w-3.5" /> Start generation
            </Button>
          )}
          {resting && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={resume} loading={busyAction === "start"}>
                <Play className="h-3.5 w-3.5" /> Resume where it stopped
              </Button>
              <Button variant="secondary" onClick={() => start(true)} loading={busyAction === "fresh"}>
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </Button>
            </div>
          )}
          {project.status === "COMPLETED" && !view.busy && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => start(false)} loading={busyAction === "start"}>
                <RotateCcw className="h-3.5 w-3.5" /> Regenerate edited scenes
              </Button>
              <Button variant="secondary" onClick={() => start(true)} loading={busyAction === "fresh"}>
                Regenerate everything
              </Button>
            </div>
          )}
          {view.busy && (
            <Link href={`/projects/${project.id}/player`} className="inline-flex items-center gap-1.5 text-sm text-paper-muted hover:text-tally">
              <Eye className="h-3.5 w-3.5" /> Watch live progress
            </Link>
          )}
          <RunControls project={project} hideResume onChanged={refresh} onDeleted={() => router.replace("/")} />
        </div>
      </div>

      {project.status === "FAILED" && project.error_message && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-cut">
          <p className="text-sm font-medium">Last run failed - finished scenes are saved</p>
          <ErrorDetails message={project.error_message} className="mt-1" />
        </div>
      )}

      {project.status === "PAUSED" && (
        <div className="rounded-card border border-tally/40 bg-tally/10 px-4 py-3 text-sm text-tally">
          Paused. Everything finished so far is kept. You can edit scenes or characters below - only what you change is
          re-rendered when you resume.
        </div>
      )}

      {project.status === "CANCELLED" && (
        <div className="rounded-card border border-ink-border bg-ink-surface px-4 py-3 text-sm text-paper-muted">
          Generation was stopped. Finished scenes are still saved - resume to continue, or start over.
        </div>
      )}

      {locked && (
        <div className="rounded-card border border-ink-border bg-ink-surface px-4 py-3 text-sm text-paper-muted">
          This project is {view.waiting ? "waiting in line" : view.stopping ? "stopping" : "rendering"}, so editing is locked. Pause it to make changes.
        </div>
      )}

      {startError && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">{startError}</div>
      )}

      <section>
        <h2 className="font-display text-lg text-paper">Cast</h2>
        <p className="text-sm text-paper-muted">
          Each character keeps one look and one voice across every scene. Check the gender - it chooses the voice.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {project.characters.map((c) => (
            <CharacterCard key={c.id} projectId={project.id} character={c} locked={locked} onSaved={refresh} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-paper">Shot list</h2>
        <p className="text-sm text-paper-muted">
          {project.scenes.length} scene{project.scenes.length === 1 ? "" : "s"}, in order. Expand any scene to edit its
          prompts or dialogue - edited scenes are re-rendered, the rest are reused.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {project.scenes.map((s) => (
            <SceneRow key={s.id} projectId={project.id} scene={s} locked={locked} onSaved={refresh} />
          ))}
        </div>
      </section>
    </div>
  );
}

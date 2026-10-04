import Link from "next/link";
import { Film, PlayCircle, Pencil } from "lucide-react";
import type { ProjectListItem } from "@/lib/types";
import { describeRun, TONE_CLASSES } from "@/lib/runState";
import { StatusBadge, statusBarColor } from "./StatusBadge";
import { RunControls } from "./RunControls";

function targetHref(project: ProjectListItem): string {
  const view = describeRun(project);
  if (project.status === "COMPLETED") return `/projects/${project.id}/player`;
  if (view.busy || project.status === "PAUSED") return `/projects/${project.id}/player`; // show live progress
  return `/projects/${project.id}/edit`;
}

export function ProjectCard({
  project,
  onChanged,
}: {
  project: ProjectListItem;
  onChanged: () => void | Promise<void>;
}) {
  const view = describeRun(project);
  const title = project.title || "Untitled project";
  const preview = project.raw_prompt || "No prompt recorded.";
  const showProgress = (view.busy || project.status === "PAUSED") && !view.waiting;
  const barTone = TONE_CLASSES[view.tone].bar;

  return (
    <div
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-card border bg-ink-surface p-5 pl-6 transition-colors hover:border-paper-faint ${
        view.running ? "border-reel/50" : "border-ink-border"
      }`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${statusBarColor(project)}`} />

      <Link href={targetHref(project)} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug text-paper line-clamp-2">{title}</h3>
          <Film className="mt-0.5 h-4 w-4 shrink-0 text-paper-faint" />
        </div>
        <p className="text-sm text-paper-muted line-clamp-3">{preview}</p>
      </Link>

      {showProgress && (
        <div>
          <div className="h-1 overflow-hidden rounded-full bg-ink-raised">
            <div className={`h-full rounded-full transition-all duration-700 ${barTone}`} style={{ width: `${Math.min(100, Math.max(project.progress_pct, 2))}%` }} />
          </div>
          {project.stage_detail && <p className="mt-1 truncate text-[11px] text-paper-faint">{project.stage_detail}</p>}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <StatusBadge project={project} />
        <div className="flex items-center gap-1">
          <RunControls project={project} compact onChanged={onChanged} onDeleted={onChanged} />
          {project.status === "COMPLETED" && !view.busy ? (
            <Link href={targetHref(project)} className="ml-1 inline-flex items-center gap-1 text-xs text-paper-faint hover:text-tally">
              <PlayCircle className="h-3.5 w-3.5" /> Watch
            </Link>
          ) : !view.busy && project.status !== "PAUSED" ? (
            <Link href={targetHref(project)} className="ml-1 inline-flex items-center gap-1 text-xs text-paper-faint hover:text-tally">
              <Pencil className="h-3.5 w-3.5" /> Review
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

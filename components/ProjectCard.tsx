import Link from "next/link";
import { Film, PlayCircle, Pencil } from "lucide-react";
import type { ProjectListItem } from "@/lib/types";
import { StatusBadge, statusBarColor } from "./StatusBadge";

function targetHref(project: ProjectListItem): string {
  if (project.status === "COMPLETED") return `/projects/${project.id}/player`;
  if (project.status === "SCRIPT_READY" || project.status === "FAILED") return `/projects/${project.id}/edit`;
  return `/projects/${project.id}/player`; // in-flight -> show progress
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const title = project.title || "Untitled project";
  const preview = project.raw_prompt || "No prompt recorded.";

  return (
    <Link
      href={targetHref(project)}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-card border border-ink-border bg-ink-surface p-5 pl-6 transition-colors hover:border-paper-faint"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${statusBarColor(project.status)}`} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg leading-snug text-paper line-clamp-2">{title}</h3>
        <Film className="mt-0.5 h-4 w-4 shrink-0 text-paper-faint" />
      </div>

      <p className="text-sm text-paper-muted line-clamp-3">{preview}</p>

      <div className="mt-auto flex items-center justify-between pt-2">
        <StatusBadge status={project.status} />
        {project.status === "COMPLETED" ? (
          <span className="inline-flex items-center gap-1 text-xs text-paper-faint group-hover:text-tally">
            <PlayCircle className="h-3.5 w-3.5" /> Watch
          </span>
        ) : project.status === "SCRIPT_READY" || project.status === "FAILED" ? (
          <span className="inline-flex items-center gap-1 text-xs text-paper-faint group-hover:text-tally">
            <Pencil className="h-3.5 w-3.5" /> Review
          </span>
        ) : null}
      </div>
    </Link>
  );
}

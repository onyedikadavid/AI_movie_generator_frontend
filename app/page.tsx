"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ProjectListItem } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load projects.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Your productions</h1>
        <p className="mt-1 text-sm text-paper-muted">
          Every story you&apos;ve turned into a script, cast, and shot list lives here.
        </p>
      </div>

      {error && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
          Couldn&apos;t reach the backend: {error}. Is the API running at{" "}
          <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>?
        </div>
      )}

      {!projects && !error && (
        <div className="flex items-center gap-2 py-16 text-paper-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading projects…
        </div>
      )}

      {projects && projects.length === 0 && <EmptyState />}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

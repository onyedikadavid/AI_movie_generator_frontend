"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { describeRun } from "@/lib/runState";
import type { ProjectListItem, QueueSnapshot } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import { QueuePanel } from "@/components/QueuePanel";
import { EmptyState } from "@/components/EmptyState";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [queue, setQueue] = useState<QueueSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const anyBusy = useRef(false);

  const load = useCallback(async () => {
    try {
      const [list, q] = await Promise.all([api.listProjects(), api.queue().catch(() => null)]);
      if (!alive.current) return;
      setProjects(list);
      setQueue(q);
      setError(null);
      anyBusy.current = list.some((p) => describeRun(p).busy);
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : "Failed to load projects.");
    }
  }, []);

  // Live-updating dashboard: fast while anything is running/queued, slow otherwise.
  useEffect(() => {
    alive.current = true;
    const loop = async () => {
      if (!document.hidden) await load();
      if (!alive.current) return;
      timer.current = setTimeout(loop, anyBusy.current ? 3000 : 10000);
    };
    loop();
    return () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Your productions</h1>
        <p className="mt-1 text-sm text-paper-muted">
          Every story you&apos;ve turned into a script, cast, and shot list lives here. Only one production renders at a time - the rest wait in line.
        </p>
      </div>

      {error && (
        <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">
          Couldn&apos;t reach the backend: {error}. Is the API running at{" "}
          <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>?
        </div>
      )}

      <QueuePanel queue={queue} />

      {!projects && !error && (
        <div className="flex items-center gap-2 py-16 text-paper-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading projects…
        </div>
      )}

      {projects && projects.length === 0 && <EmptyState />}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

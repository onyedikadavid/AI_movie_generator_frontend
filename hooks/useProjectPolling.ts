"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { describeRun } from "@/lib/runState";
import type { ProjectDetail } from "@/lib/types";

interface UseProjectPollingResult {
  project: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  /** True once the project has disappeared (it was deleted). */
  gone: boolean;
  refresh: () => Promise<void>;
}

/**
 * Fetches a project, then keeps polling: quickly (`intervalMs`) while it is
 * running / queued / stopping, slowly while it is resting (ready, paused,
 * failed, cancelled), and not at all once completed and idle.
 */
export function useProjectPolling(projectId: string, intervalMs = 4000): UseProjectPollingResult {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hadProject = useRef(false);

  const fetchOnce = useCallback(async () => {
    try {
      const data = await api.getProject(projectId);
      hadProject.current = true;
      setProject(data);
      setError(null);
      return data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404 && hadProject.current) {
        setGone(true); // it was deleted while we were looking at it
      } else {
        setError(e instanceof Error ? e.message : "Failed to load project.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const data = await fetchOnce();
      if (cancelled) return;
      if (data) {
        const view = describeRun(data);
        if (view.busy) {
          timerRef.current = setTimeout(tick, intervalMs);
        } else if (data.status !== "COMPLETED") {
          timerRef.current = setTimeout(tick, Math.max(intervalMs * 2.5, 8000)); // resting: a stale-run fix or another tab may change it
        }
      } else if (!hadProject.current || !cancelled) {
        timerRef.current = setTimeout(tick, intervalMs * 2); // transient error: keep trying
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchOnce, intervalMs]);

  const refresh = useCallback(async () => {
    await fetchOnce();
  }, [fetchOnce]);

  return { project, loading, error, gone, refresh };
}

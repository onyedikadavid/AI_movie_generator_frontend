"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ProjectDetail } from "@/lib/types";

interface UseProjectPollingResult {
  project: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetches a project once, then keeps polling every `intervalMs` while its
 * status is "in flight" (transcribing / generating / compositing). Stops
 * automatically once the project reaches a terminal state.
 */
export function useProjectPolling(projectId: string, intervalMs = 4000): UseProjectPollingResult {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOnce = useCallback(async () => {
    try {
      const data = await api.getProject(projectId);
      setProject(data);
      setError(null);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project.");
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
      // Only COMPLETED is truly final. SCRIPT_READY and FAILED are resting
      // states the user (or a retry) can move on from at any time - e.g.
      // clicking "Start generation" from SCRIPT_READY, or "Retry" from
      // FAILED - so keep polling through those instead of stopping the
      // instant a fetch happens to land on one of them.
      if (data && data.status !== "COMPLETED") {
        timerRef.current = setTimeout(tick, intervalMs);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchOnce, intervalMs]);

  return { project, loading, error, refresh: async () => { await fetchOnce(); } };
}

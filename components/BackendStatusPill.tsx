"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export function BackendStatusPill() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const res = await api.health();
        if (!cancelled) {
          setHealth(res);
          setUnreachable(false);
        }
      } catch {
        if (!cancelled) setUnreachable(true);
      } finally {
        if (!cancelled) timer = setTimeout(check, 15000);
      }
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  let color = "bg-paper-faint";
  let label = "Checking backend…";

  if (unreachable) {
    color = "bg-cut";
    label = "Backend unreachable";
  } else if (health) {
    color = health.status === "ok" ? "bg-wrap" : "bg-tally";
    label = health.status === "ok" ? "All systems ready" : "Some services degraded";
  }

  return (
    <div
      className="hidden sm:flex items-center gap-2 text-xs text-paper-muted"
      title={health ? Object.entries(health.services).map(([k, v]) => `${k}: ${v}`).join("\n") : undefined}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

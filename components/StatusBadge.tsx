import { ProjectStatus, STATUS_LABELS, IN_FLIGHT_STATUSES } from "@/lib/types";

function toneFor(status: ProjectStatus): { dot: string; text: string } {
  if (status === "COMPLETED") return { dot: "bg-wrap", text: "text-wrap" };
  if (status === "FAILED") return { dot: "bg-cut", text: "text-cut" };
  if (status === "CANCELLED") return { dot: "bg-paper-faint", text: "text-paper-muted" };
  if (status === "SCRIPT_READY" || status === "CREATED") return { dot: "bg-tally", text: "text-tally" };
  if (IN_FLIGHT_STATUSES.includes(status)) return { dot: "bg-reel", text: "text-reel" };
  return { dot: "bg-paper-faint", text: "text-paper-muted" };
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const tone = toneFor(status);
  const pulsing = IN_FLIGHT_STATUSES.includes(status);

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot} ${pulsing ? "animate-pulse-dot" : ""}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Left color bar used on project cards - encodes status without another pill. */
export function statusBarColor(status: ProjectStatus): string {
  if (status === "COMPLETED") return "bg-wrap";
  if (status === "FAILED") return "bg-cut";
  if (status === "SCRIPT_READY" || status === "CREATED") return "bg-tally";
  if (IN_FLIGHT_STATUSES.includes(status)) return "bg-reel";
  return "bg-ink-border";
}

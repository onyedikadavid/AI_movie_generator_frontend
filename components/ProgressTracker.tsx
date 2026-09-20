import { Check, Loader2 } from "lucide-react";
import type { ProjectStatus } from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/types";

const ORDER: ProjectStatus[] = [
  "GENERATING_ASSETS",
  "GENERATING_IMAGES",
  "GENERATING_AUDIO",
  "GENERATING_VIDEOS",
  "COMPOSITING",
  "COMPLETED",
];

export function ProgressTracker({ status }: { status: ProjectStatus }) {
  const currentIdx = status === "FAILED" ? -1 : ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STAGES.map((stage, i) => {
        const stageIdx = ORDER.indexOf(stage.key);
        const isDone = currentIdx > stageIdx || status === "COMPLETED";
        const isCurrent = currentIdx === stageIdx && status !== "COMPLETED";

        return (
          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                  isDone
                    ? "border-wrap bg-wrap/20 text-wrap"
                    : isCurrent
                    ? "border-reel bg-reel/20 text-reel"
                    : "border-ink-border bg-ink-surface text-paper-faint"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : isCurrent ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </div>
              <span className={`text-[11px] ${isCurrent ? "text-reel" : isDone ? "text-wrap" : "text-paper-faint"}`}>
                {stage.label}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`mx-1 h-px flex-1 ${isDone ? "bg-wrap/50" : "bg-ink-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

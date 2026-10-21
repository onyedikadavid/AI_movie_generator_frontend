"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";

/** Write what happens next. Same characters and look; only the new scenes are written and generated. */
export function ContinueStoryCard({ projectId, sceneCount, disabled }: { projectId: string; sceneCount: number; disabled?: boolean }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      await api.continueStory(projectId, { prompt: prompt.trim() || undefined, sceneCount: count ? Number(count) : undefined });
      router.push(`/projects/${projectId}/edit`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't start writing the next scene.");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-ink-border bg-ink-surface p-5">
      <h2 className="inline-flex items-center gap-2 font-display text-lg text-paper">
        <Clapperboard className="h-4 w-4 text-tally" /> Continue the story
      </h2>
      <p className="mt-1 text-sm text-paper-muted">
        Write what happens after scene {sceneCount}. The same characters, looks and voices are kept, and only the new
        scenes are generated - the finished ones stay as they are.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        disabled={disabled || busy}
        placeholder="What happens next? (optional - leave empty and the writer continues the story naturally)"
        className="mt-3 w-full resize-none rounded-card border border-ink-border bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:border-tally focus:outline-none disabled:opacity-60"
      />
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-paper-muted">New scenes</span>
          <input
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value.replace(/[^0-9]/g, "").slice(0, 1))}
            disabled={disabled || busy}
            className="w-20 rounded-card border border-ink-border bg-ink px-3 py-2 text-sm text-paper focus:border-tally focus:outline-none disabled:opacity-60"
          />
        </label>
        <Button onClick={go} loading={busy} disabled={disabled}>
          Write the next {Number(count) > 1 ? "scenes" : "scene"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-cut">{error}</p>}
    </section>
  );
}

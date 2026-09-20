"use client";

import { useState } from "react";
import { ChevronDown, MapPin, MessageSquare, Timer } from "lucide-react";
import type { SceneResponse } from "@/lib/types";
import { api } from "@/lib/api";

export function SceneRow({
  projectId,
  scene,
  locked,
}: {
  projectId: string;
  scene: SceneResponse;
  locked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visual, setVisual] = useState(scene.visual_description);
  const [motion, setMotion] = useState(scene.motion_prompt || "");
  const [narration, setNarration] = useState(scene.narration_text || "");
  const [imagePrompt, setImagePrompt] = useState(scene.image_prompt);
  const [dirty, setDirty] = useState(false);

  function markDirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setDirty(true);
    };
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateScene(projectId, scene.id, {
        visual_description: visual,
        motion_prompt: motion,
        narration_text: narration,
        image_prompt: imagePrompt,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-card border border-ink-border bg-ink-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs text-tally shrink-0">
            {String(scene.scene_number).padStart(2, "0")}
          </span>
          <span className="truncate text-sm text-paper">{scene.visual_description}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-paper-faint">
          {scene.location && (
            <span className="hidden items-center gap-1 text-xs sm:inline-flex">
              <MapPin className="h-3 w-3" /> {scene.location}
            </span>
          )}
          <span className="hidden items-center gap-1 font-mono text-xs sm:inline-flex">
            <Timer className="h-3 w-3" /> {scene.duration_seconds}s
          </span>
          {scene.dialogue_turns && scene.dialogue_turns.length > 0 && (
            <span className="hidden items-center gap-1 text-xs sm:inline-flex">
              <MessageSquare className="h-3 w-3" /> {scene.dialogue_turns.length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-ink-border px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Visual description" value={visual} onChange={markDirty(setVisual)} disabled={locked} />
            <Field label="Motion / camera direction" value={motion} onChange={markDirty(setMotion)} disabled={locked} />
            <Field label="Image prompt" value={imagePrompt} onChange={markDirty(setImagePrompt)} disabled={locked} />
            <Field label="Narration" value={narration} onChange={markDirty(setNarration)} disabled={locked} />
          </div>

          {scene.dialogue_turns && scene.dialogue_turns.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-paper-muted">Dialogue</p>
              {scene.dialogue_turns.map((turn, i) => (
                <div key={i} className="rounded-md bg-ink px-3 py-2 text-sm">
                  <span className="font-medium text-tally">{turn.speaker}: </span>
                  <span className="text-paper-muted">{turn.text}</span>
                  {turn.action && <span className="ml-2 text-xs text-paper-faint italic">({turn.action})</span>}
                </div>
              ))}
            </div>
          )}

          {!locked && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="rounded-md bg-tally px-3 py-1.5 text-xs font-semibold text-ink hover:bg-tally/90 disabled:opacity-40"
              >
                {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-xs text-paper-muted">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        disabled={disabled}
        className="mt-1 w-full resize-none rounded-md border border-ink-border bg-ink px-2.5 py-1.5 text-sm text-paper focus:border-tally focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}

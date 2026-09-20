"use client";

import { useState } from "react";
import { Check, Pencil, User, X } from "lucide-react";
import type { CharacterResponse } from "@/lib/types";
import { api } from "@/lib/api";

export function CharacterCard({
  projectId,
  character,
  locked,
}: {
  projectId: string;
  character: CharacterResponse;
  locked: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState(character.description);
  const [appearance, setAppearance] = useState(character.appearance_prompt);

  async function save() {
    setSaving(true);
    try {
      await api.updateCharacter(projectId, character.id, {
        description,
        appearance_prompt: appearance,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-card border border-ink-border bg-ink-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-raised text-paper-muted">
            <User className="h-4 w-4" />
          </span>
          <h4 className="font-display text-base text-paper">{character.name}</h4>
        </div>
        {!locked && !editing && (
          <button onClick={() => setEditing(true)} className="text-paper-faint hover:text-tally" aria-label={`Edit ${character.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <Field label="Personality / role" value={description} onChange={setDescription} />
          <Field label="Appearance (for image consistency)" value={appearance} onChange={setAppearance} />
          <div className="mt-1 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setDescription(character.description);
                setAppearance(character.appearance_prompt);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-paper-muted hover:bg-ink-raised"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-tally px-2 py-1 text-xs font-semibold text-ink hover:bg-tally/90 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-1.5">
          <p className="text-sm text-paper-muted">{character.description}</p>
          <p className="text-xs text-paper-faint">{character.appearance_prompt}</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs text-paper-muted">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-none rounded-md border border-ink-border bg-ink px-2.5 py-1.5 text-sm text-paper focus:border-tally focus:outline-none"
      />
    </label>
  );
}

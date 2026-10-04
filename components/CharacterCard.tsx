"use client";

import { useState } from "react";
import { Check, Mic, Pencil, User, X } from "lucide-react";
import type { CharacterResponse } from "@/lib/types";
import { api, ApiError } from "@/lib/api";

const GENDERS = [
  { value: "male", label: "Male voice" },
  { value: "female", label: "Female voice" },
];
const AGES = [
  { value: "child", label: "Child" },
  { value: "teen", label: "Teen" },
  { value: "adult", label: "Adult" },
  { value: "elder", label: "Elder" },
];

export function CharacterCard({
  projectId,
  character,
  locked,
  onSaved,
}: {
  projectId: string;
  character: CharacterResponse;
  locked: boolean;
  onSaved?: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(character.description);
  const [appearance, setAppearance] = useState(character.appearance_prompt);
  const [gender, setGender] = useState(character.gender || "");
  const [age, setAge] = useState(character.age_group || "");

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.updateCharacter(projectId, character.id, {
        description,
        appearance_prompt: appearance,
        ...(gender ? { gender } : {}),
        ...(age ? { age_group: age } : {}),
      });
      setEditing(false);
      await onSaved?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  const voiceNote = [character.gender, character.age_group].filter(Boolean).join(" · ");

  return (
    <div className="rounded-card border border-ink-border bg-ink-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-raised text-paper-muted">
            <User className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-display text-base leading-tight text-paper">{character.name}</h4>
            {voiceNote && (
              <p className="flex items-center gap-1 text-[11px] text-paper-faint">
                <Mic className="h-3 w-3" /> {voiceNote}
              </p>
            )}
          </div>
        </div>
        {!locked && !editing && (
          <button onClick={() => setEditing(true)} className="text-paper-faint hover:text-tally" aria-label={`Edit ${character.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Select label="Voice" value={gender} onChange={setGender} options={GENDERS} placeholder="Auto" />
            <Select label="Age" value={age} onChange={setAge} options={AGES} placeholder="Auto" />
          </div>
          <Field label="Personality / role" value={description} onChange={setDescription} />
          <Field label="Appearance (for image consistency)" value={appearance} onChange={setAppearance} />
          {error && <p className="text-xs text-cut">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
                setDescription(character.description);
                setAppearance(character.appearance_prompt);
                setGender(character.gender || "");
                setAge(character.age_group || "");
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

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <label className="block text-xs text-paper-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-border bg-ink px-2 py-1.5 text-sm text-paper focus:border-tally focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
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

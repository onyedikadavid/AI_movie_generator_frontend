"use client";

import { useState } from "react";
import { Check, Layers, MapPin, Pencil, X } from "lucide-react";
import type { LocationResponse, SceneResponse } from "@/lib/types";
import { api, ApiError } from "@/lib/api";

/** One place in the scene bible. Every scene set here is drawn with this one description, so the place looks the same
 *  each time the story comes back to it. */
export function PlaceCard({
  projectId,
  place,
  scenes,
  others,
  locked,
  onSaved,
}: {
  projectId: string;
  place: LocationResponse;
  scenes: SceneResponse[];
  others: LocationResponse[];
  locked: boolean;
  onSaved?: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description);
  const [mergeInto, setMergeInto] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setSaving(true);
    setError(null);
    try {
      await fn();
      setEditing(false);
      setMergeInto("");
      await onSaved?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  const sceneList = scenes.map((s) => s.scene_number).join(", ");

  return (
    <div className="rounded-card border border-ink-border bg-ink-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-raised text-paper-muted">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-display text-base leading-tight text-paper">{place.name}</h4>
            <p className="text-[11px] text-paper-faint">
              {scenes.length === 0 ? "No scenes yet" : `Scene${scenes.length === 1 ? "" : "s"} ${sceneList}`}
            </p>
          </div>
        </div>
        {!locked && !editing && (
          <button onClick={() => setEditing(true)} className="text-paper-faint hover:text-tally" aria-label={`Edit ${place.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <label className="block text-xs text-paper-muted">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-border bg-ink px-2.5 py-1.5 text-sm text-paper focus:border-tally focus:outline-none"
            />
          </label>
          <label className="block text-xs text-paper-muted">
            How this place looks (used in every scene set here)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-md border border-ink-border bg-ink px-2.5 py-1.5 text-sm text-paper focus:border-tally focus:outline-none"
            />
          </label>
          {others.length > 0 && (
            <div className="flex items-end gap-2">
              <label className="block flex-1 text-xs text-paper-muted">
                Same place as another entry?
                <select
                  value={mergeInto}
                  onChange={(e) => setMergeInto(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink-border bg-ink px-2 py-1.5 text-sm text-paper focus:border-tally focus:outline-none"
                >
                  <option value="">Keep separate</option>
                  {others.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={!mergeInto || saving}
                onClick={() => run(() => api.mergeLocations(projectId, place.id, mergeInto))}
                className="inline-flex items-center gap-1 rounded-md border border-ink-border px-2 py-1.5 text-xs text-paper-muted hover:bg-ink-raised disabled:opacity-40"
              >
                <Layers className="h-3 w-3" /> Merge
              </button>
            </div>
          )}
          {error && <p className="text-xs text-cut">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
                setName(place.name);
                setDescription(place.description);
                setMergeInto("");
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-paper-muted hover:bg-ink-raised"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={() => run(() => api.updateLocation(projectId, place.id, { name, description }))}
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-tally px-2 py-1 text-xs font-semibold text-ink hover:bg-tally/90 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-paper-muted">{place.description || "Described when the film is generated."}</p>
      )}
    </div>
  );
}

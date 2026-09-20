"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Upload, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";

const GENRES = ["", "Sci-fi", "Drama", "Comedy", "Thriller", "Fantasy", "Nollywood", "Documentary"];
const TONES = ["", "Lighthearted", "Tense", "Hopeful", "Melancholic", "Comedic", "Epic"];
const STYLES = ["", "Photorealistic", "Anime", "Watercolor", "Claymation", "Noir", "Studio Ghibli-inspired"];

export default function NewProjectPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("");
  const [tone, setTone] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioFile(new File([blob], "voice-note.webm", { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Couldn't access your microphone. Check your browser's permissions, or type your idea instead.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() && !audioFile) {
      setError("Describe your idea in text or record a voice note first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const project = await api.createProject({
        prompt: prompt.trim() || undefined,
        audioFile: audioFile || undefined,
        genre: genre || undefined,
        tone: tone || undefined,
        visualStyle: visualStyle || undefined,
      });
      router.push(`/projects/${project.id}/edit`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong creating the project.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-paper">Create a new video</h1>
      <p className="mt-1 text-sm text-paper-muted">
        Describe your idea, or record it. We&apos;ll break it into a script, cast, and shot list you can review before anything renders.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-paper">
            Your idea
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="A young Nigerian boy discovers an abandoned robot in his village and uses it to help his community…"
            className="mt-2 w-full resize-none rounded-card border border-ink-border bg-ink-surface px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-tally focus:outline-none"
          />

          <div className="mt-3 flex items-center gap-3">
            {!audioFile && !recording && (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 text-sm text-paper-muted hover:text-tally"
              >
                <Mic className="h-4 w-4" /> Or record a voice note instead
              </button>
            )}
            {recording && (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 text-sm text-cut"
              >
                <Square className="h-3.5 w-3.5 fill-current" /> Stop recording
              </button>
            )}
            {audioFile && !recording && (
              <div className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-raised px-3 py-1 text-xs text-paper-muted">
                <Upload className="h-3.5 w-3.5" /> {audioFile.name}
                <button type="button" onClick={() => setAudioFile(null)} aria-label="Remove audio">
                  <X className="h-3.5 w-3.5 hover:text-cut" />
                </button>
              </div>
            )}
          </div>
        </div>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <legend className="mb-1 text-sm font-medium text-paper sm:col-span-3">
            Optional stylistic direction
          </legend>
          <Select label="Genre" value={genre} onChange={setGenre} options={GENRES} />
          <Select label="Tone" value={tone} onChange={setTone} options={TONES} />
          <Select label="Visual style" value={visualStyle} onChange={setVisualStyle} options={STYLES} />
        </fieldset>

        {error && (
          <div className="rounded-card border border-cut/40 bg-cut/10 px-4 py-3 text-sm text-cut">{error}</div>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>
            {submitting ? "Breaking down your story…" : "Generate script"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm text-paper-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-ink-border bg-ink-surface px-3 py-2 text-sm text-paper focus:border-tally focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt || "none"} value={opt}>
            {opt || "No preference"}
          </option>
        ))}
      </select>
    </label>
  );
}

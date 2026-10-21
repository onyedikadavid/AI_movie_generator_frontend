import type {
  CharacterResponse,
  DeleteResult,
  QueueSnapshot,
  CharacterUpdatePayload,
  HealthResponse,
  ProjectDetail,
  ProjectListItem,
  ProjectResponse,
  SceneResponse,
  SceneUpdatePayload,
  VideoMode,
} from "./types";

// Strip any trailing slash(es) - if NEXT_PUBLIC_API_URL is set to
// "https://host.com/" instead of "https://host.com", the naive template
// string below would produce a double slash ("https://host.com//api/v1"),
// which doesn't match any FastAPI route and 404s on every single request.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const API_V1 = `${API_BASE_URL}/api/v1`;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON - keep statusText
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health(): Promise<HealthResponse> {
    return fetch(`${API_V1}/health`, { cache: "no-store" }).then(handle<HealthResponse>);
  },

  listProjects(): Promise<ProjectListItem[]> {
    return fetch(`${API_V1}/projects`, { cache: "no-store" }).then(handle<ProjectListItem[]>);
  },

  getProject(id: string): Promise<ProjectDetail> {
    return fetch(`${API_V1}/projects/${id}`, { cache: "no-store" }).then(handle<ProjectDetail>);
  },

  createProject(input: {
    prompt?: string;
    audioFile?: File;
    genre?: string;
    tone?: string;
    visualStyle?: string;
    videoMode?: VideoMode;
    narratorEnabled?: boolean;
    sceneCount?: number;
    sceneSeconds?: number;
  }): Promise<ProjectResponse> {
    const form = new FormData();
    if (input.prompt) form.append("prompt", input.prompt);
    if (input.audioFile) form.append("audio_file", input.audioFile);
    if (input.genre) form.append("genre", input.genre);
    if (input.tone) form.append("tone", input.tone);
    if (input.visualStyle) form.append("visual_style", input.visualStyle);
    if (input.videoMode) form.append("video_mode", input.videoMode);
    if (input.sceneCount) form.append("scene_count", String(input.sceneCount));
    if (input.sceneSeconds) form.append("scene_seconds", String(input.sceneSeconds));
    if (input.narratorEnabled !== undefined) form.append("narrator_enabled", String(input.narratorEnabled));

    return fetch(`${API_V1}/projects`, { method: "POST", body: form }).then(handle<ProjectResponse>);
  },

  /** Change how the project is generated (image first vs text-to-video). Takes effect on the next run. */
  updateProjectSettings(id: string, payload: { video_mode?: VideoMode; narrator_enabled?: boolean; scene_seconds?: number | null }): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<ProjectResponse>);
  },

  /** Idle project: deleted at once. Running project: stopped first, then removed (deleting = true). */
  deleteProject(id: string): Promise<DeleteResult> {
    return fetch(`${API_V1}/projects/${id}`, { method: "DELETE" }).then(handle<DeleteResult>);
  },

  /** `fresh` = redo every scene from scratch; otherwise only what's missing or edited is rendered. */
  runPipeline(id: string, fresh = false): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/run-pipeline?fresh=${fresh ? "true" : "false"}`, { method: "POST" }).then(
      handle<ProjectResponse>
    );
  },

  /** Write the next scene(s) of this story with the same characters. Leave the prompt empty for an automatic continuation. */
  continueStory(id: string, input: { prompt?: string; sceneCount?: number }): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/continue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input.prompt ?? null, scene_count: input.sceneCount ?? null }),
    }).then(handle<ProjectResponse>);
  },

  resumeProject(id: string): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/resume`, { method: "POST" }).then(handle<ProjectResponse>);
  },

  pauseProject(id: string): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/pause`, { method: "POST" }).then(handle<ProjectResponse>);
  },

  cancelProject(id: string): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/cancel`, { method: "POST" }).then(handle<ProjectResponse>);
  },

  queue(): Promise<QueueSnapshot> {
    return fetch(`${API_V1}/queue`, { cache: "no-store" }).then(handle<QueueSnapshot>);
  },

  updateScene(projectId: string, sceneId: string, payload: SceneUpdatePayload): Promise<SceneResponse> {
    return fetch(`${API_V1}/projects/${projectId}/scenes/${sceneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<SceneResponse>);
  },

  updateCharacter(
    projectId: string,
    characterId: string,
    payload: CharacterUpdatePayload
  ): Promise<CharacterResponse> {
    return fetch(`${API_V1}/projects/${projectId}/characters/${characterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle<CharacterResponse>);
  },
};

/** Save a remote or local video as a file (fetch -> blob, so it downloads even from another domain). */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  } catch {
    window.open(url, "_blank");   // last resort: open it, the browser's own Save works from there
  }
}

/** Resolve a backend-relative storage path (or an already-absolute URL) into a fetchable URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Backend stores absolute filesystem paths like /app/storage/projects/<id>/scene_1/keyframe.png
  // or .../storage/projects/... - normalize to whatever comes after "storage/".
  const marker = "storage/";
  const idx = path.replace(/\\/g, "/").indexOf(marker);
  if (idx === -1) return null;
  const relative = path.replace(/\\/g, "/").slice(idx + marker.length);
  return `${API_BASE_URL}/storage/${relative}`;
}

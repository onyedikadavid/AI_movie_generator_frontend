import type {
  CharacterResponse,
  CharacterUpdatePayload,
  HealthResponse,
  ProjectDetail,
  ProjectListItem,
  ProjectResponse,
  SceneResponse,
  SceneUpdatePayload,
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
  }): Promise<ProjectResponse> {
    const form = new FormData();
    if (input.prompt) form.append("prompt", input.prompt);
    if (input.audioFile) form.append("audio_file", input.audioFile);
    if (input.genre) form.append("genre", input.genre);
    if (input.tone) form.append("tone", input.tone);
    if (input.visualStyle) form.append("visual_style", input.visualStyle);

    return fetch(`${API_V1}/projects`, { method: "POST", body: form }).then(handle<ProjectResponse>);
  },

  deleteProject(id: string): Promise<void> {
    return fetch(`${API_V1}/projects/${id}`, { method: "DELETE" }).then(handle<void>);
  },

  runPipeline(id: string): Promise<ProjectResponse> {
    return fetch(`${API_V1}/projects/${id}/run-pipeline`, { method: "POST" }).then(handle<ProjectResponse>);
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

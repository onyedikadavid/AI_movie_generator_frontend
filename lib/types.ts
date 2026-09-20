// Mirrors app/schemas/*.py on the backend. Keep in sync manually - this is a
// small enough surface that generating an OpenAPI client isn't worth it yet.

export type ProjectStatus =
  | "CREATED"
  | "TRANSCRIBING"
  | "GENERATING_SCRIPT"
  | "SCRIPT_READY"
  | "GENERATING_ASSETS"
  | "GENERATING_IMAGES"
  | "GENERATING_VIDEOS"
  | "GENERATING_AUDIO"
  | "COMPOSITING"
  | "COMPLETED"
  | "FAILED";

export const IN_FLIGHT_STATUSES: ProjectStatus[] = [
  // Included so polling doesn't stop in the brief window right after project
  // creation, before the Celery worker has picked up the script-breakdown task.
  "CREATED",
  "TRANSCRIBING",
  "GENERATING_SCRIPT",
  "GENERATING_ASSETS",
  "GENERATING_IMAGES",
  "GENERATING_VIDEOS",
  "GENERATING_AUDIO",
  "COMPOSITING",
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  CREATED: "Created",
  TRANSCRIBING: "Transcribing audio",
  GENERATING_SCRIPT: "Writing script",
  SCRIPT_READY: "Ready for review",
  GENERATING_ASSETS: "Generating assets",
  GENERATING_IMAGES: "Generating keyframes",
  GENERATING_VIDEOS: "Generating video",
  GENERATING_AUDIO: "Generating narration",
  COMPOSITING: "Compositing final cut",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

// Ordered stages used to drive the progress tracker on the player view.
export const PIPELINE_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "GENERATING_ASSETS", label: "Starting" },
  { key: "GENERATING_IMAGES", label: "Keyframes" },
  { key: "GENERATING_AUDIO", label: "Narration" },
  { key: "GENERATING_VIDEOS", label: "Motion" },
  { key: "COMPOSITING", label: "Final cut" },
  { key: "COMPLETED", label: "Done" },
];

export interface ProjectListItem {
  id: string;
  title: string | null;
  status: ProjectStatus;
  raw_prompt: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  title: string | null;
  status: ProjectStatus;
  raw_prompt: string | null;
  final_video_path: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ScriptResponse {
  id: string;
  project_id: string;
  genre: string | null;
  tone: string | null;
  visual_style: string | null;
  full_text: string | null;
}

export interface CharacterResponse {
  id: string;
  project_id: string;
  name: string;
  description: string;
  appearance_prompt: string;
  reference_image_path: string | null;
}

export interface DialogueTurn {
  speaker: string;
  text: string;
  expression?: string;
  action?: string;
}

export interface SceneResponse {
  id: string;
  project_id: string;
  scene_number: number;
  duration_seconds: number;
  location: string | null;
  visual_description: string;
  narration_text: string | null;
  image_prompt: string;
  motion_prompt: string | null;
  image_path: string | null;
  video_path: string | null;
  audio_path: string | null;
  dialogue_turns: DialogueTurn[] | null;
}

export interface ProjectDetail extends ProjectResponse {
  script: ScriptResponse | null;
  characters: CharacterResponse[];
  scenes: SceneResponse[];
}

export interface SceneUpdatePayload {
  duration_seconds?: number;
  location?: string;
  visual_description?: string;
  narration_text?: string;
  image_prompt?: string;
  motion_prompt?: string;
}

export interface CharacterUpdatePayload {
  name?: string;
  description?: string;
  appearance_prompt?: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  services: {
    api: string;
    database: string;
    redis: string;
    ollama: string;
  };
}

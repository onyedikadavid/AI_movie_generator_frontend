// Mirrors app/schemas/*.py on the backend. Keep in sync manually - this is a
// small enough surface that generating an OpenAPI client isn't worth it yet.

export type ProjectStatus =
  | "CREATED"
  | "TRANSCRIBING"
  | "GENERATING_SCRIPT"
  | "SCRIPT_READY"
  | "QUEUED"
  | "GENERATING_ASSETS"
  | "GENERATING_IMAGES"
  | "GENERATING_VIDEOS"
  | "GENERATING_AUDIO"
  | "COMPOSITING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

/** Statuses in which a worker is genuinely executing the project right now. */
export const ACTIVE_STATUSES: ProjectStatus[] = [
  "TRANSCRIBING",
  "GENERATING_SCRIPT",
  "GENERATING_ASSETS",
  "GENERATING_IMAGES",
  "GENERATING_VIDEOS",
  "GENERATING_AUDIO",
  "COMPOSITING",
];

/** Waiting for the (single) worker slot. CREATED is the legacy equivalent. */
export const WAITING_STATUSES: ProjectStatus[] = ["QUEUED", "CREATED"];

/** Active or waiting - the project is "busy" and can't be edited. */
export const IN_FLIGHT_STATUSES: ProjectStatus[] = [...WAITING_STATUSES, ...ACTIVE_STATUSES];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  CREATED: "Queued",
  QUEUED: "Queued",
  TRANSCRIBING: "Transcribing audio",
  GENERATING_SCRIPT: "Writing script",
  SCRIPT_READY: "Ready for review",
  GENERATING_ASSETS: "Starting generation",
  GENERATING_IMAGES: "Drawing keyframes",
  GENERATING_VIDEOS: "Animating video",
  GENERATING_AUDIO: "Recording voices",
  COMPOSITING: "Cutting the final film",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

// Ordered stages used to drive the progress tracker on the player view.
export const PIPELINE_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "GENERATING_ASSETS", label: "Starting" },
  { key: "GENERATING_AUDIO", label: "Voices" },
  { key: "GENERATING_IMAGES", label: "Keyframes" },
  { key: "GENERATING_VIDEOS", label: "Motion" },
  { key: "COMPOSITING", label: "Final cut" },
  { key: "COMPLETED", label: "Done" },
];

/** Live run state - present on both list items and full projects. */
export interface RunState {
  status: ProjectStatus;
  error_message: string | null;
  warning_message: string | null;
  stage_detail: string | null;
  progress_pct: number;
  current_scene: number | null;
  total_scenes: number | null;
  /** A stop was requested and the worker hasn't finished stopping yet. */
  pause_requested: boolean;
  cancel_requested: boolean;
  delete_requested: boolean;
  /** How many times the project was resumed after a pause / failure / cancel. */
  resume_count: number;
  /** 1 = next to run. Only set while QUEUED. */
  queue_position: number | null;
  heartbeat_at: string | null;
}

export interface ProjectListItem extends RunState {
  id: string;
  title: string | null;
  raw_prompt: string | null;
  created_at: string;
}

export interface ProjectResponse extends RunState {
  id: string;
  title: string | null;
  raw_prompt: string | null;
  final_video_path: string | null;
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
  gender: string | null;
  age_group: string | null;
  voice_id: string | null;
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
  sound_design: string | null;
  image_path: string | null;
  video_path: string | null;
  audio_path: string | null;
  dialogue_turns: DialogueTurn[] | null;
  characters_present: string[] | null;
  render_status: string | null;
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
  sound_design?: string;
  dialogue_turns?: DialogueTurn[];
}

export interface CharacterUpdatePayload {
  name?: string;
  description?: string;
  appearance_prompt?: string;
  gender?: string;
  age_group?: string;
}

export interface QueueEntry {
  id: string;
  title: string;
  position: number;
}

export interface RunningEntry {
  id: string;
  title: string;
  status: ProjectStatus;
  progress_pct: number;
  stage_detail: string | null;
  current_scene: number | null;
  total_scenes: number | null;
  pause_requested: boolean;
  cancel_requested: boolean;
  delete_requested: boolean;
  heartbeat_age_seconds: number | null;
}

export interface QueueSnapshot {
  running: RunningEntry | null;
  queued: QueueEntry[];
  oldest_queued_age_seconds: number | null;
}

export interface DeleteResult {
  deleted: boolean;
  deleting: boolean;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  services: {
    api: string;
    database: string;
    redis: string;
    ollama: string;
    image_server?: string;
    video_server?: string;
  };
}

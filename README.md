# Reel Room — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind frontend for the AI
story-to-video production pipeline. Talks to the FastAPI backend in
`../Movie_production_pipeline_backend`.

## Views

| Route                        | PRD view                        | Purpose |
|-------------------------------|----------------------------------|---------|
| `/`                            | View 1 — Project Dashboard       | Grid of all projects with live status |
| `/projects/new`                | View 2 — Project Creation Form   | Text or voice-note idea + optional genre/tone/style |
| `/projects/[id]/edit`          | View 3 — Scene & Character Review| Editable cast + shot list, "Start generation" |
| `/projects/[id]/player`        | View 4 — Progress & Player       | Live pipeline progress, keyframes, final video |

The flow matches the PRD's two-step design: creating a project only runs the
fast script-breakdown phase (`SCRIPT_READY`); nothing is rendered until you
explicitly hit **Start generation** on the review screen, so you can fix a
character's appearance prompt or a scene's motion direction first without
burning GPU time.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # point at your backend if not localhost:8000
npm run dev
```

Open http://localhost:3000. Make sure the backend (FastAPI, Celery worker,
Postgres, Redis, Ollama) is running first — see
`../Movie_production_pipeline_backend/README.md`. The navbar's status pill
polls `GET /api/v1/health` every 15s so you can see at a glance if the API,
database, Redis, or Ollama are unreachable.

## Notes on production-readiness

- **No server secrets in the client bundle.** The only env var used
  (`NEXT_PUBLIC_API_URL`) is meant to be public — it's just the backend's
  address.
- **Polling, not websockets.** The pipeline can take minutes per project, so
  the review and player pages poll `GET /projects/{id}` every few seconds
  while status is non-terminal, and stop automatically once it reaches
  `COMPLETED` or `FAILED`. This keeps the stack simple (no websocket/SSE
  server needed) at the cost of a few seconds of latency on status updates,
  which is a reasonable trade-off for a rendering pipeline measured in
  minutes.
- **Optimistic-free editing.** Scene/character edits are saved explicitly
  (a "Save changes" button, disabled until something's actually dirty) rather
  than firing a PATCH on every keystroke, to avoid hammering the API and to
  give the user an explicit "yes, keep this" moment before a field feeds into
  an expensive generation step.
- **Editing is locked once generation starts.** The backend already rejects
  `PATCH` calls once a project leaves `SCRIPT_READY`/`FAILED`; the UI mirrors
  that by disabling the edit controls in the same states, so the two stay in
  sync instead of relying on either side alone.
- **Media comes straight from the backend's `/storage` mount.** No file
  upload/proxy layer in the frontend — keyframes, audio, and the final video
  are all just `<img>`/`<video>` tags pointed at
  `${NEXT_PUBLIC_API_URL}/storage/...`.
- **Graceful empty/error states** for an unreachable backend, an empty
  project list, and a failed generation run (with a one-click retry that
  calls `run-pipeline` again).

## Build for production

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend's URL before building —
it's baked in at build time, not read at runtime.

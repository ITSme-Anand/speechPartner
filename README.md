# SpeechPartner

SpeechPartner is a full-stack app for spoken English practice with narration analysis and interactive grammar drills.

## Mobile app

The Expo/React Native client lives in `frontend_mobile_ui/` and talks to
this same backend. See `frontend_mobile_ui/README.md` for its setup and a
full manual test walkthrough — read it before testing on a phone, it covers
two gotchas (Supabase key type, backend host binding) that otherwise fail
silently on every single request.

## Quick Start (Docker)

Anyone using this project should be able to clone it and run a single command.

1. Clone the repository.
2. Create environment files from examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill required values in:
- `backend/.env` (Supabase project URL + **secret** key — not the
  publishable/anon key, see the warning in `backend/.env.example` — plus
  Groq key, Gemini key)
- `frontend/.env` (Supabase URL + anon key)
4. Run `database/schema.sql` in your Supabase project's SQL editor (once,
   before first run) to create the tables.
5. Start everything:

```bash
docker compose up --build -d
```

6. Open the app:
- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8000/`

## Docker Files

- Backend image: `backend/Dockerfile`
- Frontend image: `frontend/Dockerfile`
- Frontend web server config: `frontend/nginx.conf`
- Service orchestration: `docker-compose.yml`

## Stop Services

```bash
docker compose down
```

## Troubleshooting

- If startup fails with a Docker daemon error, start Docker Desktop first.
- If frontend cannot call backend, verify `VITE_API_BASE_URL` in `frontend/.env`.
- If backend fails at startup, verify required keys in `backend/.env`.
- If every request returns a bare 500 with no detail, you almost certainly
  put the publishable/anon key in `SUPABASE_SERVICE_KEY` instead of the
  secret key — see the warning in `backend/.env.example`.

# SpeechPartner — Mobile Frontend

React Native + Expo (TypeScript) client for SpeechPartner, implementing the
same product flow as the web app (`../frontend`) against the same FastAPI
backend (`../backend`): **Narrate → Result → Drill (Concept → MCQ →
Scenario) → Summary**.

## What's implemented

Onboarding (consent + mic permission) → Auth (sign up / log in / guest,
email+password) → Home (past sessions + start new) → Narrate (topic entry +
recording) → Processing → Result (feedback + PDF download/share) → Drill
Guide → Drill Concept → Drill MCQ → Drill Scenario (recording) → Drill
Summary → Settings.

Not implemented (explicitly deferred):
- Google/Apple sign-in on native (the web app's Google OAuth is a
  browser-redirect flow that needs a different implementation strategy on
  React Native — buttons are present but disabled).
- Push notifications for "session reminders" (the Settings toggle is UI-only).
- Deleting an account / managing recordings (stubbed with an alert — wire to
  the backend's delete endpoints once they exist).
- App icon/splash branding assets, EAS build profiles, and store submission
  — see "Known gaps" below.

## Tech stack

React Native + Expo SDK 57 (TypeScript) · React Navigation · Axios ·
`@supabase/supabase-js` (auth) · `expo-audio` (recording) ·
`expo-file-system` + `expo-sharing` (PDF download/share) ·
`expo-secure-store` (token storage).

## Project layout

```
App.tsx                     Entry point: font loading, providers, splash screen, env check
src/
  theme/                    Design tokens (colors, type) + font loader
  lib/                      env.ts, supabase.ts, api.ts, secureStorage.ts
  context/AuthContext.tsx   Sign up/in/out, guest mode, consent state
  hooks/useVoiceRecorder.ts Shared record/pause/resume/stop logic (Narrate + Drill Scenario)
  navigation/               Two-stack router (signed-out vs signed-in)
  screens/                  One file per screen
  services/narrationService.ts   All backend calls (narrations, drills, drill-steps, PDF)
  components/               PrimaryButton, ScreenContainer
```

## Run & test locally

The backend needs real API keys before anything beyond the login screen
will work. None of this is configured yet.

### 1. Provision the backend's dependencies

1. **Supabase project** (free tier): create one, run `../database/schema.sql`
   in its SQL editor, enable Email/Password auth (you can turn off "confirm
   email" for faster local testing). From Project Settings → API, collect
   the Project URL, the **publishable/anon** key, and the **secret**
   key — these are two different keys, see the warning below.
2. **Groq key** at console.groq.com (Whisper STT + the drill-generator LLM)
   and **Gemini key** at aistudio.google.com (speech analysis) — both have
   free tiers.
3. `cp ../backend/.env.example ../backend/.env` and fill in the Supabase
   URL/secret key/JWT secret + the Groq and Gemini keys.

   > **The #1 way this breaks:** `SUPABASE_SERVICE_KEY` must be the
   > **secret** key, not the publishable/anon key. Every table in
   > `database/schema.sql` has Row-Level Security enabled with zero
   > policies, so the publishable key can write to *nothing* — this fails
   > silently as a generic 500 on literally every request, with no useful
   > error message, regardless of what you record or how long you speak.

### 2. Run the backend

```bash
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```
**The `--host 0.0.0.0` matters** if you're testing on a physical phone —
without it, uvicorn only binds `127.0.0.1` and is unreachable from any
other device on the network, even with the right IP configured on the app
side. (`docker compose up backend` from the repo root does this
automatically via Docker's port mapping, so it's the safer default if
you'd rather not think about it.) Verify with `curl http://localhost:8000/`
— should return a health-check JSON body — and then verify again via
whatever LAN IP/hostname you're about to put in the mobile app's `.env`,
since "works on localhost" doesn't guarantee "reachable from a phone."

### 3. Configure and run the mobile app

```bash
cp .env.example .env
```

Fill in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — same
  Supabase project as the backend.
- `EXPO_PUBLIC_API_BASE_URL` — **depends on where the app runs**, since
  "localhost" means different things on a phone/emulator than on your laptop:
  - iOS Simulator → `http://localhost:8000` works as-is.
  - Android Emulator → use `http://10.0.2.2:8000`.
  - Physical device via Expo Go → use your machine's LAN IP (e.g.
    `http://192.168.1.x:8000`), same Wi-Fi network as the machine running
    the backend.

```bash
npm install
npx expo start
```

Press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with
Expo Go on a physical device.

### 4. Manual walkthrough

1. **Onboarding**: accept both consent checkboxes, allow microphone access.
2. **Auth**: sign up with any email + 8-character password (or "Continue
   without an account" to skip in as a guest — note a guest has no auth
   token, so narration/drill submission will fail until signed in).
3. **Home**: empty past-sessions list on first run. Tap "Start New Narration".
4. **Narrate**: type a topic or tap "Give me a random topic", lock it in,
   record ~15-30 seconds of speech, submit. **Processing can take a while
   — 30-60+ seconds isn't unusual** (Gemini analysis of a full paragraph
   measured at ~37s in testing), and Gemini occasionally returns a
   transient 503 under load, which the backend now retries/falls back on
   automatically. The mobile client's request timeout is 3 minutes for
   this reason — don't assume it's stuck if the spinner sits there a while.
5. **Result**: check the feedback renders, tap "Download PDF" (opens the
   native share sheet), tap "Start Drill Session".
6. **Drill Guide → Concept → MCQ (answer all 3) → Scenario** (record a
   response to the prompt, submit).
7. **Drill Summary**: watch it poll ("Scoring your drill session…") then
   show accuracy/error stats or a "No errors found" state.
8. **Home**: confirm the new narration now appears in the past-sessions list.

### 5. Edge cases worth checking

- Starting a drill before any narration exists should surface the backend's
  "no error profile yet" error as a clean alert, not a crash.
- Logging out and back in should restore the session via `expo-secure-store`
  without re-prompting onboarding.

### Static checks (run after any code change)

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
```

## Known gaps before an app-store submission

- **No app icon/splash branding assets** — `app.json` references none yet
  (Expo defaults are used). Add real assets under `assets/` before an EAS
  build.
- **No `eas.json` build profiles** and no Apple Developer Program / Google
  Play Console enrollment yet — both are required (and only the account
  owner can set them up) before `eas build`/`eas submit` can ship to
  TestFlight or the Play Store.
- **No public backend host** — the backend only runs locally via
  `docker compose` today. A store build needs `EXPO_PUBLIC_API_BASE_URL`
  pointing at a real HTTPS host (e.g. Fly.io, Render, Railway).
- **No Google/Apple sign-in** on native yet (see above).
- **No automated tests** — consider `@testing-library/react-native` if this
  becomes a longer-lived project.

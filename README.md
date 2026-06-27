# StudyBuddy

StudyBuddy is an AI-powered study workspace that helps students turn their own materials into flashcards, quizzes, summaries, and a source-grounded chat assistant.

Users can create study sets, generate active-recall flashcards, take practice quizzes with explanations, and ask questions about their uploaded material.

## Product overview

StudyBuddy is an AI-powered study workspace that turns course materials, notes, and readings into flashcards, quizzes, summaries, and a source-grounded study assistant. It helps students practice active recall, test understanding, and chat with their own study materials.

StudyBuddy lets students:

1. Sign in with Supabase Auth
2. Create **Study Sets** from pasted text or uploaded files (.txt, .pdf)
3. Auto-generate a **summary**, **10–20 flashcards**, and **5–10 quiz questions** via LLM
4. Study with an interactive **flashcard viewer** (flip, shuffle, self-rating)
5. Take **quizzes** with instant feedback and explanations
6. Chat with **StudyBuddy** — a source-grounded study assistant for their material

## Tech stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **shadcn/ui**-style components
- **Supabase** — Auth, Postgres, Storage, RLS
- **Eve by Vercel** — primary study chat agent (`withEve` + `useEveAgent`)
- **Vercel AI SDK** — study material generation (`/api/generate`, with Eve tool orchestration when available) and fallback chat
- **Resend** — welcome & study-set-ready emails (optional)
- **pdf-parse** — PDF text extraction

## Setup

### 1. Install locally

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor (or Supabase CLI)
3. Enable Email auth under Authentication → Providers
4. Add your site URL (`http://localhost:3000`) and redirect URL (`http://localhost:3000/auth/callback`) under Authentication → URL Configuration
5. Copy your project URL and keys into `.env.local`

### 3. AI keys

For local development, set `OPENAI_API_KEY`.

For production on Vercel, use [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) and set `AI_GATEWAY_API_KEY`.

### 4. Resend (optional)

**Sandbox (no domain):** set only `RESEND_API_KEY` from [resend.com](https://resend.com). Emails send from `onboarding@resend.dev` and can only be delivered to the email on your Resend account — fine for testing welcome and study-set-ready notifications on yourself.

**Production:** verify your own domain in Resend, then set `RESEND_FROM_EMAIL=StudyBuddy <hello@yourdomain.com>`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Service role key (server/agent only) |
| `OPENAI_API_KEY` | Yes† | OpenAI key for local dev |
| `AI_GATEWAY_API_KEY` | Yes† | Vercel AI Gateway key for production |
| `NEXT_PUBLIC_APP_URL` | No | App URL for email links |
| `RESEND_API_KEY` | No | Resend API key for emails (sandbox: only delivers to your Resend account email) |
| `RESEND_FROM_EMAIL` | No | Sender address; defaults to `StudyBuddy <onboarding@resend.dev>` |

\* Required for Eve agent tools (server-side Supabase access in tools).  
† One of `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY` is required.

## Database schema

Tables: `profiles`, `study_sets`, `flashcards`, `quizzes`, `quiz_questions`, `chat_messages`

All tables have Row Level Security — users can only access their own data. See `supabase/migrations/001_initial_schema.sql`.

## Deploy on Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

Supabase redirect URL: `https://your-app.vercel.app/auth/callback`

## Eve Study Agent

StudyBuddy's chat experience is powered by [Eve by Vercel](https://vercel.com/eve). The agent lives in the `agent/` directory and uses TypeScript tools to retrieve study set context, save chat messages, generate practice questions, and create visual explanations.

The agent is source-grounded. It answers questions using the active study set's source text, summary, flashcards, quiz questions, and recent chat history.

### How chat works

1. User opens `/study-sets/[id]/chat`.
2. `ChatPanel` uses `useEveAgent` from `eve/react` (same-origin via `withEve()`).
3. Each turn sends `clientContext` with `studySetId` and `userId`.
4. The Eve agent calls tools as needed.
5. Completed turns are persisted through `/api/chat/persist`.
6. If Eve is unavailable, the UI falls back to `/api/chat`.

### Agent layout

```
agent/
  instructions.md
  agent.ts
  channels/eve.ts
  lib/
  skills/ian-xiaohei-illustrations-en/
  tools/
    getStudySetContext.ts
    saveChatMessage.ts
    generatePracticeQuestion.ts
    visualizeConcept.ts
```

### Local development

```bash
npm run dev
```

`withEve()` in `next.config.ts` mounts Eve on the same origin as Next.js.

### Production on Vercel

Deploy normally. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set so Eve tools can read/write study data. Chat auth uses the user's Supabase bearer token on Eve HTTP routes.

## Xiaohei Visual Concept Mode

StudyBuddy can create visual explanations using the [`ian-xiaohei-illustrations-en`](https://github.com/tojileon/ian-xiaohei-illustrations-en) skill.

### Where the skill lives

```text
agent/skills/ian-xiaohei-illustrations-en/
  SKILL.md
  references/
```

Files are vendored from the upstream repository. Eve loads them via `ctx.getSkill("ian-xiaohei-illustrations-en")`.

### How `visualizeConcept` works

1. Verifies study set ownership.
2. Loads study set context from Supabase.
3. Confirms the concept is present in the material.
4. Reads Xiaohei skill references (`prompt-template.md`, `style-dna.md`, `xiaohei-ip.md`).
5. Returns a grounded `illustrationPrompt`.

### Deployment limitation

The upstream skill expects an `image_gen` tool for PNG output. **This deployment does not run image generation in Vercel production.** `visualizeConcept` returns `illustrationFormat: "prompt"` and the UI shows the skill-compatible prompt. Wire an image provider later for automated rendering.

### Fallback behavior

If Eve is down, chat falls back to `/api/chat`. Visual concept mode requires the Eve agent.

## Fallback chat route

`/api/chat` remains as a temporary fallback when Eve is unavailable. The primary chat UI uses Eve via `useEveAgent`.

## Error Monitoring with Sentry

StudyBuddy uses Sentry for error monitoring and performance tracing across the Next.js app, server actions, API routes, and Eve agent flows.

### Setup

Required environment variables:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (also written to `.env.sentry-build-plugin` when you run the Sentry wizard)
- `SENTRY_ORG` (`my-org-guk`)
- `SENTRY_PROJECT` (`javascript-nextjs`)
- `SENTRY_ENVIRONMENT`

To finish wizard setup interactively:

```bash
npx @sentry/wizard@latest -i nextjs --saas --org my-org-guk --project javascript-nextjs
```

The wizard will open a browser login, write your DSN into config/env files, and create `.env.sentry-build-plugin` for source map uploads.

### Privacy

StudyBuddy does not send source material, chat messages, uploaded files, flashcard text, or quiz answers to Sentry. Only sanitized metadata such as feature name, study set ID, user ID, counts, and error types are captured.

### Local test

In development, visit `/dev/sentry-test` to confirm Sentry is receiving events.

## Project structure

```
src/
  app/                    # Pages & API routes
  components/             # UI components
  lib/                    # Supabase, AI, validations, visualization helpers
agent/                    # Eve study chat agent
supabase/migrations/      # SQL schema
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## MVP features

- [x] Supabase auth (email/password)
- [x] Create study sets from pasted text
- [x] PDF & text file upload
- [x] LLM generation (summary, flashcards, quiz)
- [x] Interactive flashcard study mode
- [x] Quiz with scoring & review
- [x] Eve-powered source-grounded chat
- [x] Xiaohei visual concept mode (prompt-based)
- [x] Welcome & ready emails (Resend, optional)
- [x] RLS-secured database
- [x] Vercel-deployable

## Stretch goals (not implemented)

- Spaced repetition scheduling
- Quiz history persistence
- Export flashcards to CSV
- Shareable public study sets
- Agent-generated study plans

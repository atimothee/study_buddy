# StudyBuddy

A NotebookLM-inspired study app that turns your notes into flashcards, quizzes, and a chat-based study assistant.

## Product overview

StudyBuddy lets students:

1. Sign in with Supabase Auth
2. Create **Study Sets** from pasted text or uploaded files (.txt, .pdf)
3. Auto-generate a **summary**, **10–20 flashcards**, and **5–10 quiz questions** via LLM
4. Study with an interactive **flashcard viewer** (flip, shuffle, self-rating)
5. Take **quizzes** with instant feedback and explanations
6. Chat with **StudyBuddy** — grounded in your study material

## Tech stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **shadcn/ui**-style components
- **Supabase** — Auth, Postgres, Storage, RLS
- **Vercel AI SDK** — content generation & chat (fallback)
- **eve.dev** — scaffolded agent in `/agent` (optional, see below)
- **Resend** — welcome & study-set-ready emails (optional)
- **pdf-parse** — PDF text extraction

## Setup

### 1. Clone and install

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

Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to send welcome emails on signup and notifications when study materials are generated.

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
| `RESEND_API_KEY` | No | Resend API key for emails |
| `RESEND_FROM_EMAIL` | No | Sender address for Resend |
| `EVE_AGENT_URL` | No | Deployed eve agent URL (future) |

\* Required for eve agent tools; optional for basic app (uses user-scoped Supabase client).  
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

## eve integration

The `/agent` directory contains a scaffolded [eve](https://eve.dev) agent:

```
agent/
  instructions.md          # StudyBuddy persona & behavior
  agent.ts                 # defineAgent config
  tools/
    getStudySetContext.ts  # Load study set data from Supabase
    saveChatMessage.ts     # Persist chat messages
    generatePracticeQuestion.ts
```

### Current status

The web app uses **`/api/chat`** (Vercel AI SDK + streaming) as the production chat implementation. This is stable and deployable today.

The eve agent is scaffolded and ready for when you want durable, tool-augmented agent sessions:

```bash
# Local eve dev (requires eve CLI)
npx eve@latest start
```

Deploy the eve agent separately with `vercel deploy`, then point `EVE_AGENT_URL` at it and wire the `ChatPanel` to the eve HTTP channel.

### Fallback chat (`/api/chat`)

- Streams responses via Vercel AI SDK
- Injects study set context (source, summary, flashcards, quiz)
- Persists messages to `chat_messages`
- Rate limited (10 req/min per user)

## Project structure

```
src/
  app/                    # Pages & API routes
  components/             # UI components
  lib/                    # Supabase, AI, validations
agent/                    # eve agent (optional)
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
- [x] Chat with StudyBuddy
- [x] Welcome & ready emails (Resend, optional)
- [x] RLS-secured database
- [x] Vercel-deployable

## Stretch goals (not implemented)

- Spaced repetition scheduling
- Quiz history persistence
- Export flashcards to CSV
- Shareable public study sets
- Agent-generated study plans

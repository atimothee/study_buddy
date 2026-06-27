# StudyBuddy

StudyBuddy is an AI-powered study workspace that turns your own materials into flashcards, quizzes, summaries, and a source-grounded study tutor.

Upload notes or readings, generate active-recall flashcards (including cloze deletion cards), take practice quizzes with explanations, and chat with an assistant grounded in your source material.

## Product overview

StudyBuddy helps students:

1. Sign in with Supabase Auth
2. Create **study sets** from pasted text or uploaded files (.txt, .pdf)
3. Auto-generate a **summary**, **flashcards** (basic, cloze, definition, compare/contrast, application), and **quiz questions**
4. Study with an interactive **flashcard viewer** (flip, shuffle, filter by type and difficulty)
5. Take **quizzes** with instant feedback and explanations
6. Chat with **StudyBuddy** — a source-grounded study tutor for their material
7. Request **visual explanations** with diagram or illustration output

## Demo

Use the existing **Attention Is All You Need** study set for a live walkthrough:

1. **Sign in** and open your dashboard
2. **Open the study set** titled "Attention Is All You Need"
3. **Review the summary** on the study set overview page
4. **Study cloze deletion flashcards** — go to Flashcards, filter by Cloze, and flip cards to reveal answers and explanations
5. **Take the quiz** — answer multiple-choice questions and read the explanations
6. **Open Chat** — click a suggested prompt chip like "Explain self-attention simply"
7. **Visualize multi-head attention** — click "Visualize multi-head attention" or use the "Visualize this" button on any assistant reply

The demo set already exists in your account. StudyBuddy does not seed or overwrite it.

### Eve and AI status

| Feature | Primary path | Fallback |
|---------|--------------|----------|
| **Chat** | Eve agent (`useEveAgent` → `/eve/v1/*`) | Vercel AI SDK streaming via `/api/chat` |
| **Study generation** | Eve orchestration when healthy | Direct AI SDK `generateObject` in `/api/generate` |
| **Visual explanations** | `/api/visualize` with Xiaohei skill references | SVG diagram fallback if skill or API fails |

Chat keeps the `/api/chat` fallback route until Eve is fully reliable in production. Visualization failures never break chat — a polished SVG or prompt card is shown instead.

## Tech stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **shadcn/ui**-style components
- **Supabase** — Auth, Postgres, Storage, RLS
- **Eve by Vercel** — primary study chat agent (`withEve` + `useEveAgent`)
- **Vercel AI SDK** — study material generation and fallback chat
- **Resend** — welcome and study-set-ready emails (optional)
- **pdf-parse** — PDF text extraction

## Setup

### 1. Install locally

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order via the SQL Editor (or Supabase CLI):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_flashcard_card_types.sql`
3. Enable Email auth under Authentication → Providers
4. Add your site URL (`http://localhost:3000`) and redirect URL (`http://localhost:3000/auth/callback`) under Authentication → URL Configuration
5. Copy your project URL and keys into `.env.local`

### 3. AI keys

For local development, set `OPENAI_API_KEY`.

For production on Vercel, use [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) and set `AI_GATEWAY_API_KEY`.

### 4. Resend (optional)

**Sandbox (no domain):** set only `RESEND_API_KEY` from [resend.com](https://resend.com). Emails send from `onboarding@resend.dev` and can only be delivered to the email on your Resend account.

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
| `RESEND_API_KEY` | No | Resend API key for emails |
| `RESEND_FROM_EMAIL` | No | Sender address |

\* Required for Eve agent tools.  
† One of `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY` is required.

## Database schema

Tables: `profiles`, `study_sets`, `flashcards`, `quizzes`, `quiz_questions`, `chat_messages`

Flashcards support typed cards (`basic`, `cloze`, `definition`, `compare_contrast`, `application`) with optional `cloze_text`, `answer`, `explanation`, `tags`, and `source_quote`.

All tables have Row Level Security — users can only access their own data.

## Deploy on Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

Supabase redirect URL: `https://your-app.vercel.app/auth/callback`

## Eve Study Agent

StudyBuddy's chat experience is powered by [Eve by Vercel](https://vercel.com/eve). The agent lives in the `agent/` directory and uses tools to retrieve study set context, save chat messages, generate practice questions, and create visual explanations.

The agent is source-grounded. It answers using the active study set's source text, summary, flashcards, quiz questions, and recent chat history.

### How chat works

1. User opens `/study-sets/[id]/chat`
2. `ChatPanel` uses `useEveAgent` from `eve/react`
3. Each turn sends `clientContext` with `studySetId` and `userId`
4. Suggested prompt chips send messages on click
5. Visual requests route to `/api/visualize` (with SVG fallback)
6. Completed turns persist through `/api/chat/persist`
7. If Eve is unavailable, the UI falls back to `/api/chat`

### Agent layout

```
agent/
  instructions.md
  agent.ts
  channels/eve.ts
  skills/ian-xiaohei-illustrations-en/
  tools/
```

## Visual explanations

StudyBuddy can create visual explanations using the `ian-xiaohei-illustrations-en` skill (vendored under `agent/skills/`).

When the skill is available, `/api/visualize` returns a grounded illustration prompt. When it is not, or on failure, a polished SVG diagram fallback is shown instead. Chat never crashes on visualization errors.

Image generation (`image_gen`) is not wired in production — prompts and SVG diagrams are shown in the UI.

## Error monitoring with Sentry

StudyBuddy uses Sentry for error monitoring. Set `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, and related variables. StudyBuddy does not send source material or chat content to Sentry.

## Project structure

```
src/
  app/                    # Pages and API routes
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
- [x] Create study sets from pasted text or PDF
- [x] LLM generation (summary, typed flashcards including cloze, quiz)
- [x] Interactive flashcard study mode with filters
- [x] Quiz with scoring and review
- [x] Eve-powered source-grounded chat with prompt chips
- [x] Visual explanations (Xiaohei prompt + SVG fallback)
- [x] Generation progress stepper
- [x] RLS-secured database
- [x] Vercel-deployable

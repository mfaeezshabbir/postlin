# Postlin

AI-powered LinkedIn assistant

This repository contains a Next.js + TypeScript app with Prisma (MongoDB), BullMQ workers (Redis), and modular folders for auth, drafts, notifications, publishing, users, and analytics.

## What’s included

- Next.js 15 (App Router) + TypeScript
- Prisma configured for MongoDB (`prisma/schema.prisma`)
- Generated Prisma client: `./app/generated/prisma` (created by `npx prisma generate`)
- Modular folder layout under `modules/*` (auth, drafts, notifications, publisher, users, analytics)
- Shared utilities in `lib/` (Prisma wrapper, logger, Redis helper)
- Worker stubs in `workers/` for BullMQ job processing
- `docker-compose.yml` with MongoDB and Redis for local development
- `.env.example` with recommended environment variables

## Key features

- **Google Sign-In**: Primary authentication method for easy onboarding
- **Onboarding Flow**: Guided setup for LinkedIn connection (optional) and Gemini API key (required for AI features)
- **Per-User Gemini Keys**: Each user provides their own Gemini API key, stored encrypted with AES-256-GCM
- **LangChain.js Integration**: Modular AI workflows with support for multiple LLM providers (Gemini, with OpenAI and HuggingFace coming soon)
- **LinkedIn Connection**: Optional connection for auto-publishing and analytics
- **AI-Assisted Content Generation**: Uses user's personal Gemini API key with advanced prompt engineering
- **Manual Posting**: Create and copy posts without LinkedIn connection
- **Scheduling**: Worker-based publishing system with BullMQ + Redis
- **Secure Architecture**: Encrypted secrets, JWT sessions, modular design

## Authentication & Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env` file

### LinkedIn OAuth Setup (Optional)

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Request access to "Sign In with LinkedIn using OpenID Connect" and "Share on LinkedIn"
4. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
5. Copy the Client ID and Client Secret to your `.env` file

See `docs/LINKEDIN_OAUTH_SETUP.md` for detailed instructions.

### Gemini API Key Encryption

Each user provides their own Gemini API key during onboarding. Keys are encrypted at rest using AES-256-GCM.

Generate an encryption key for your application:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add this to your `.env` as `GEMINI_KEYS_ENCRYPTION_KEY`.

## Quickstart (local)

1. Copy `.env.example` to `.env` and configure all required variables:

```bash
cp .env.example .env
# edit .env to add any API keys or NEXTAUTH_SECRET
```

2. Start local services (MongoDB + Redis) with Docker (optional):

```bash
docker compose up -d
```

If you have a system `mongod` or Redis already running on the same ports, either stop those services or update `docker-compose.yml` to use different host ports.

3. Install dependencies (if not already):

```bash
npm install
```

4. Generate Prisma client and push schema to the DB:

```bash
npx prisma generate
npx prisma db push
```

The repository already includes a Prisma schema for MongoDB and a generated client location `./app/generated/prisma`.

5. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Useful commands

- Start Docker services: `docker compose up -d`
- Stop Docker services: `docker compose down`
- Generate Prisma client: `npx prisma generate`
- Push Prisma schema to DB: `npx prisma db push`
- Typecheck: `npx tsc --noEmit` (or `./node_modules/.bin/tsc --noEmit`)
- Run dev server: `npm run dev`

## Folder layout

- `app/` — Next.js app (routes/pages)
- `prisma/schema.prisma` — Prisma schema (MongoDB models)
- `app/generated/prisma` — generated Prisma client (output by `prisma generate`)
- `modules/auth` — NextAuth config and LinkedIn helpers
- `modules/drafts` — draft creation/update logic
- `modules/langchain` — LangChain.js integration for AI providers (see `docs/LANGCHAIN_INTEGRATION.md`)
- `modules/notifications` — Resend email helpers
- `modules/publisher` — LinkedIn publishing helpers
- `modules/users` — user and preference helpers
- `modules/analytics` — engagement tracking helpers
- `lib/` — shared utilities (logger, prisma wrapper, redis helper)
- `workers/` — BullMQ worker stubs

## Roadmap & features

This project tracks planned features and short-term roadmap items in `docs/features.md`.

Notable planned feature (inspired by shnai0/linkedin-post-generator):

- LinkedIn Post Optimization — an AI-driven "Optimize for LinkedIn" flow which accepts a draft/idea and returns an optimized post. Features include per-"vibe" prompt templates (Story, Crisp, List, Case Study, etc.), streaming generation to the UI, and a rule-based ranking/validation function that scores posts according to LinkedIn heuristics. See `docs/features.md` for the full spec and TODO list.

You can add more roadmap items to `docs/features.md` as the project evolves.

## Notes & next steps

- NextAuth: `modules/auth/getNextAuthOptions()` is a stub — wire it into `pages/api/auth/[...nextauth].ts` (or the App Router equivalent) and configure the LinkedIn provider using `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

- Redis: `lib/redis.ts` will try to use `ioredis` when `REDIS_URL` is present; otherwise it provides an in-memory fallback for local dev. Install `ioredis` if you want a real Redis client.

- Workers: `workers/index.ts` contains queue name constants and a `startWorkers()` stub — implement BullMQ `Worker` instances and job processors using `bullmq` and your Redis instance.

- Publishing & notifications: the LinkedIn and Resend stubs are placeholders. Add real API integration and error handling before using in production.

- Docker port conflicts: if `docker compose up` fails due to ports already in use (common for `27017` or `6379`), either stop the local services or adjust host port mappings in `docker-compose.yml`.

## Troubleshooting

- `prisma db push` fails with connection errors: verify `DATABASE_URL` in `.env` and ensure MongoDB is reachable.
- Type errors: run `npx tsc --noEmit` to see compiler errors. I fixed the `lib/prisma.ts` global declaration earlier to satisfy the compiler.

## License

This project is licensed under the Apache License 2.0. See the `LICENSE` file for details.

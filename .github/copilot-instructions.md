## Quick orientation for AI coding agents

This file contains focused, repo-specific guidance so an AI can be productive immediately in Postlin.
Keep edits small, preserve generated artifacts, and follow the project's conventions shown below.

### Big-picture architecture (one-paragraph)
- Next.js 15 (App Router) web app in `app/` (server/client components). Data layer: Prisma with MongoDB (`prisma/schema.prisma`) and a generated client at `app/generated/prisma`.
- Background jobs use BullMQ + Redis and are implemented in `workers/` (see `workers/index.ts`, `workers/scheduler.ts`). Job producers live in API routes under `app/api/*` and in `modules/*`.
- Auth: NextAuth wired in `app/api/auth/[...nextauth]/route.ts`, provider config in `modules/auth` (LinkedIn OIDC specifics). Shared helpers live in `lib/` (e.g., `lib/prisma.ts`, `lib/redis.ts`, `lib/auth.ts`).

### Critical developer workflows (what to run)
- Dev server: `npm run dev` (uses `next dev --turbopack`).
- Tests: `npm run test` (Jest). There is `jest.setup.ts` and Prisma mocks under `__tests__/` and `test/helpers`.
- Prisma: `npx prisma generate` is run postinstall; generated client outputs to `app/generated/prisma`. Use `npx prisma db push` for schema sync in dev.
- Worker runner: `npm run worker` runs `tsx scripts/run-worker.ts` — prefer this for local worker testing.
- Docker: `docker compose up -d` brings up local MongoDB + Redis matching `docker-compose.yml`.

### Project-specific conventions and pitfalls (do not assume defaults)
- Prisma client is generated into `app/generated/prisma`. Do NOT change that path without updating imports.
- `lib/prisma.ts` uses a lazy/dynamic require + global caching pattern to avoid top-level import failures during build. When editing DB access, preserve that lazy init pattern or import carefully.
- NextAuth is configured through `modules/auth` and consumed by `app/api/auth/[...nextauth]/route.ts`. LinkedIn uses OIDC-like claims; check `docs/LinkedIn_OAUTH_SETUP.md` and `docs/LinkedIn OAuth Configuration Fix` notes.
- Workers use `bullmq` + `ioredis`. Code expects `REDIS_URL` / `REDIS_HOST` env vars; tests may mock Redis (see `test/helpers/mockPrisma.ts`, `jest.prisma.mock.ts`).

### Where changes typically belong (examples)
- Add API endpoints: `app/api/<feature>/route.ts` (App Router RPC-like routes). Example: AI generation endpoints under `app/api/ai/generate`.
- Domain features live in `modules/<feature>/index.ts`. Look for `modules/drafts`, `modules/publisher`, `modules/notifications`.
- Shared utilities: put purely-logic helpers in `lib/` and keep side-effectful code (DB/Redis) behind the wrappers there.

### Dataflow & model examples (Prisma)
- Posts: see `prisma/schema.prisma` -> `model Post` fields you will commonly use: `status`, `scheduledAt`, `linkedInPostId`, `isAIGenerated`, `draftText`, `finalText`.
- Users: `User` stores `accessToken`, `refreshToken`, and `linkedInId`. Auth flows read/write these fields via `modules/auth`.

### Recommended editing rules for AI agents
- Preserve generated code and build artifacts: do not modify files under `app/generated/prisma` — update Prisma schema and re-run `prisma generate` instead.
- When changing DB code: keep the lazy init pattern in `lib/prisma.ts` to avoid build/runtime surprises.
- For API routes follow the App Router conventions (export `GET`, `POST` handlers or default server components). Use `getServerSession(getAuthOptions())` (see `lib/auth.ts`) for server-side auth.
- When adding background work, add a queue name to `workers/index.ts` and register processors in `workers/*` and the `scripts/run-worker.ts` runner.

### Key files to inspect before editing
- project entry & routes: `app/`, `app/page.tsx`, `app/api/` (auth, ai, drafts, publish)
- auth: `modules/auth/*` and `app/api/auth/[...nextauth]/route.ts`
- prisma: `prisma/schema.prisma` and `lib/prisma.ts` (lazy client)
- workers/queues: `workers/index.ts`, `workers/scheduler.ts`, `scripts/run-worker.ts`
- docker and env: `docker-compose.yml`, `.env.example`, `docs/LINKEDIN_OAUTH_SETUP.md`
- tests & mocks: `__tests__/`, `test/helpers/` and `jest.*` files

### Quick examples (copyable patterns)
- Lazy Prisma access (follow the pattern in `lib/prisma.ts`) — prefer using the exported default from that file rather than importing `PrismaClient` directly.
- Protect sensitive changes: update `.env.example` and `docs/` when adding new env vars.

If anything above is unclear or you want more examples (e.g., common mutations, worker job payload shapes, or a sample API route), say which area to expand and I will iterate.

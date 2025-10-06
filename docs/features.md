# Features (Planned / Roadmap)

This document lists planned features and integration ideas for Postli. Use this as a centralized place to track feature specs, rationale, and minimal implementation notes.

## LinkedIn Post Optimization (inspired by shnai0/linkedin-post-generator)

Summary
- Add an AI-powered "Optimize for LinkedIn" feature that takes a draft/idea and returns an optimized LinkedIn post.
- Support multiple "vibes" (Story, Crisp, List, Unpopular opinion, Case Study, etc.) with per-vibe prompt templates that guide the LLM to produce posts tailored to LinkedIn engagement patterns.
- Stream generated content to the UI for instant feedback (ReadableStream + incremental rendering).
- Provide a rule-based ranking/validation function that scores posts by LinkedIn heuristics (length, hashtags, emojis, link usage, spacing, mentions, media flag) and returns validations and a score.

User flow
1. User writes or pastes a draft/idea in the composer.
2. User selects a "vibe" and clicks "Optimize".
3. The server calls the LLM with a per-vibe prompt and streams the generated post to the frontend.
4. The UI shows the generated post, the ranking score, validations/suggestions, and buttons to copy or publish the post to LinkedIn.

Minimum viable feature set (MVP)
- Backend
  - New endpoint: `POST /api/ai/optimize` (or extend existing `/api/ai/generate`) that accepts { originalPost, vibe }
  - Build per-vibe prompt templates and safe defaults for length/temperature
  - Reuse existing LLM client (Gemini/OpenAI) and support streaming responses
  - Add `lib/linkedin-algorithm.ts` implementing rule-based scoring and validations
- Frontend
  - Add vibe dropdown to composer and a "Generate optimized post" button
  - Stream results into a preview box, show score + validations, and allow copy/publish
- Data & Auth
  - Reuse Prisma LinkedIn token fields for posting flows
  - Gate publish action to authenticated users with LinkedIn OAuth
- Tests & Docs
  - Unit tests for the ranking/validation logic
  - Add docs (this file) and short README for the optimize endpoint

Edge cases / notes
- Preserve mentions and numbers per prompt rules when present in the original draft.
- Handle empty/too-short inputs with a validation (don't hit the LLM unnecessarily).
- Rate-limiting and cost controls: enforce max length and throttle requests.
- Safety: sanitize and run basic content checks (no PII leaking, no explicit content).

Implementation TODO (short)
- [ ] Create `lib/linkedin-algorithm.ts` (scoring + validations)
- [ ] Add `app/api/ai/optimize/route.ts` (streaming LLM call using existing AI client)
- [ ] Add UI wiring: vibe dropdown + optimize button + streamed preview + score display
- [ ] Unit tests for algorithm and endpoint
- [ ] Docs: update QUICK_START / DEPLOYMENT if extra env vars are needed (GEMINI/OpenAI config, stream limits)

References
- Inspiration: https://github.com/shnai0/linkedin-post-generator — vibe-based prompts, streaming UI, and ranking heuristics


---

If you want, I can implement the backend pieces now (algorithm + optimize endpoint) and wire a small demo UI in the composer. Which LLM do you prefer for optimization: Google Gemini (current default) or OpenAI (ChatCompletions/Responses)?
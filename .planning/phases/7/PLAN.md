# Phase 7: Production Deployment Pipeline

## Goal
Remove Anthropic dependency, switch LLM to OpenAI GPT-4o-mini, add Docker containerization, and extend GitHub Actions CI to auto-deploy to Hostinger VPS on push to master.

## Success Criteria
1. App uses only 2 API keys: `OPENAI_API_KEY` and `PINECONE_API_KEY` (no Anthropic)
2. GPT-4o-mini generates chat responses with context-only system prompt (no web search)
3. `docker build` produces a working multi-stage image
4. CI pipeline: lint → type-check → build → SSH deploy to VPS
5. App runs on VPS at `72.60.187.119:3000` via Docker container

## Tasks

### Task 1: Switch LLM from Anthropic to OpenAI GPT-4o-mini
**Status:** Done
- [x] Add `streamChatResponse()` to `src/lib/openai.ts` using GPT-4o-mini
- [x] Update `src/app/api/chat/route.ts` to import from `openai` instead of `anthropic`
- [x] Delete `src/lib/anthropic.ts`
- [x] Uninstall `@anthropic-ai/sdk` dependency
- [x] Remove `ANTHROPIC_API_KEY` from `.env.local` and `.env.local.example`
- [x] Update system prompt: answer only from context, friendly "no answer" message
- [x] Update UI badge from "Claude Sonnet" to "GPT-4o mini"

### Task 2: Docker containerization
**Status:** Done
- [x] Create multi-stage `Dockerfile` (deps → build → runner)
- [x] Create `.dockerignore`
- [x] Clean up `.gitignore` (add `*.png`, `.playwright-mcp/`)
- [x] Delete leftover screenshot PNGs

### Task 3: CI/CD — Extend GitHub Actions for VPS deployment
**Status:** Done
- [x] Update `.github/workflows/ci.yml` with deploy job
- [x] Deploy job: SSH into VPS → git pull → docker build → docker run
- [x] Deploy only on push to master (not PRs)
- [x] Remove `ANTHROPIC_API_KEY` stub from CI build step

### Task 4: VPS initial setup
**Status:** Pending
- [ ] Add GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- [ ] Clone repo on VPS (`~/pinecone-rag`)
- [ ] Create `.env.local` on VPS with production API keys
- [ ] Test full CI/CD pipeline end-to-end

## Execution Order
1. ~~Task 1~~ (done)
2. ~~Task 2~~ (done)
3. ~~Task 3~~ (done)
4. Task 4 — VPS setup + GitHub Secrets + end-to-end test

## Dependencies
- VPS SSH access: confirmed (root@72.60.187.119, Docker installed)
- GitHub CLI: needed to set secrets

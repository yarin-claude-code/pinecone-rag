# Pinecone RAG Chat

## Project Overview
RAG chat web app — queries Pinecone vector indexes with OpenAI embeddings, streams Claude responses, renders in a ChatGPT-style dark UI.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS (minimal dark theme)
- Pinecone SDK (@pinecone-database/pinecone) — standard indexes, NOT integrated
- OpenAI SDK — text-embedding-3-small (1536 dims) for embeddings only
- OpenAI SDK — GPT-4o-mini for LLM responses (streaming)
- react-markdown + remark-gfm + @tailwindcss/typography for rendering

## Deep Docs (ClaudeVault)

For detailed project structure, architecture, data flow, and code explanations, see:
- `ClaudeVault/Projects/pinecone-rag/CODE_EXPLANATION.md`
- `ClaudeVault/Projects/pinecone-rag/CURRENT_STATE.md`

Configured via `.claude/rules/vault-knowledge.md`.

## Key Conventions
- All API keys via env vars: `OPENAI_API_KEY`, `PINECONE_API_KEY`
- Pinecone indexes: `devops-brain`, `claude-brain` — metadata schema: `{ text: string, source: string }`
- API route: `POST /api/chat` — accepts `{ message, index, history }`, returns streaming response
- No unnecessary abstractions — simple, readable code
- Async/await everywhere, graceful error handling

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint

## Context7 Plugin
- Use Context7 to fetch live docs before writing SDK code for: `@pinecone-database/pinecone`, `openai`, `@anthropic-ai/sdk`, `next` (App Router)
- Resolve the library ID first (`resolve-library-id`), then query docs (`query-docs`) for the specific API you need

## Planning
- GSD planning docs in `.planning/`
- Atomic git commits per phase

## Git Branching
- Each phase gets its own branch: `phase/<N>-<short-name>` (e.g., `phase/2-rag-api-route`)
- Branch from `main`, commit all phase work there, merge to `main` when phase is complete
- Existing branches: `phase/1-project-scaffolding` (already merged to main)

## Phase Checklist (MANDATORY for every phase)
Before writing any code for a phase, complete these steps IN ORDER:
1. **Create planning folder:** `.planning/phases/<N>/PLAN.md` with goal, success criteria, tasks, execution order
2. **Create branch:** `git checkout -b phase/<N>-<short-name>` from `main`
3. **Write code** on that branch
4. **Commit** all work (code + planning docs + STATE.md update) on the phase branch
5. **Merge** to `main` when phase is complete

Never commit phase work directly to `main`. Never skip the planning folder or branch creation.

## Dev Server
- Before starting `npm run dev`, kill any existing process on port 3000 first: `lsof -ti:3000 | xargs kill -9 2>/dev/null || true`
- Never accumulate multiple dev servers on different ports (3000, 3001, 3002, etc.)

## Port Cleanup (MANDATORY)
- After EVERY use of a dev server or any process on a port (3000, 3001, etc.), **kill the process immediately** when done
- Never leave orphaned processes running on any port

## Playwright Verification (MANDATORY for every phase)
- Before considering any phase complete, **run Playwright visual verification** using `playwright-cli`:
  1. Start dev server on port 3000
  2. Screenshot key states (empty, mobile, error, etc.) via CLI
  3. Kill port 3000
- This is non-negotiable — every phase must be visually verified before committing

## PR Review Routine (MANDATORY for every PR)
When opening a PR, always perform a self-review before requesting merge:
1. **Create the PR** with a summary, bullet points of changes, and a test plan checklist
2. **Add a review comment** covering:
   - Security implications of the changes
   - Bug fix correctness
   - Architecture notes and trade-offs
   - Potential follow-ups or tech debt introduced
3. **Add inline comments** on:
   - Any hardcoded values that should be configurable
   - Complex logic that warrants explanation
   - Patterns that could be improved in future iterations
4. **Never merge without review** — the PR must have at least one review comment before merging

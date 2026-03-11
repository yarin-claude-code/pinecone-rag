# Roadmap — Pinecone RAG Chat

## Phase 1: Project Scaffolding
**Goal:** Next.js 14 app boots with Tailwind dark theme, empty chat layout renders.

**Tasks:**
1. Initialize Next.js 14 project structure (App Router, `src/` directory)
2. Configure TailwindCSS with dark theme defaults
3. Create root layout (`layout.tsx`) with dark background, font setup
4. Create placeholder `page.tsx` with basic chat layout skeleton
5. Create shared TypeScript types (`src/types/index.ts`)
6. Add `.gitignore`, `.env.local` template

**Success:** `npm run dev` shows dark-themed page with chat layout skeleton.

---

## Phase 2: Backend — RAG API Route
**Goal:** `/api/chat` endpoint embeds, queries Pinecone, streams Claude response.

**Tasks:**
1. Create `src/lib/openai.ts` — embedding helper function
2. Create `src/lib/pinecone.ts` — Pinecone client + query helper
3. Create `src/lib/anthropic.ts` — Claude streaming helper
4. Create `src/app/api/chat/route.ts` — POST handler wiring it all together
5. Implement ReadableStream response with proper SSE headers
6. Add error handling for each external service call

**Success:** `curl -X POST /api/chat` with valid payload returns streamed text.

---

## Phase 3: Frontend — Chat UI Components
**Goal:** Full interactive chat interface with streaming display.

**Tasks:**
1. Create `IndexSelector` component — dropdown for index selection
2. Create `ChatMessage` component — user/assistant message bubbles with markdown
3. Create `ChatInput` component — input box + send button
4. Build main `page.tsx` — wire components together with state management
5. Implement streaming fetch + real-time message appending
6. Add loading/typing indicator during streaming
7. Auto-scroll to latest message

**Success:** Full chat flow works — type question, see streamed markdown response.

---

## Phase 4: Polish & Error Handling
**Goal:** Production-ready with graceful errors, responsive design, edge cases.

**Tasks:**
1. Handle API errors — show user-friendly messages in chat
2. Handle empty Pinecone results gracefully
3. Responsive design — mobile-friendly layout
4. Disable send during streaming
5. Support Enter key to send, Shift+Enter for newlines
6. Final visual polish — spacing, typography, transitions

**Success:** App handles all error cases gracefully, looks good on mobile and desktop.

---

## Phase 5: Frontend Design Refactor
**Goal:** Redesign the frontend to match the RAG Nexus reference design — left sidebar with navigation, polished chat layout with source cards, refined input bar, and overall premium dark UI.

**Tasks:**
1. Add left sidebar with app branding ("RAG Nexus" style), "New Exploration" button, workspace nav (Knowledge Base, History), and Settings link
2. Redesign chat header — show current index/conversation name + model badge
3. Restyle user message bubbles (right-aligned, purple/blue) and assistant bubbles (left-aligned with avatar, dark card)
4. Add "Sources & Context" section below assistant messages — source cards with file name, details, and relevance score badges
5. Add response action buttons (thumbs up/down, copy) and generation time indicator
6. Redesign input bar — rounded pill style with attachment icon, mic icon, and colored send arrow
7. Add footer disclaimer text below input
8. Overall visual polish — spacing, typography, colors to match reference design

**Success:** UI closely matches the RAG Nexus reference design with sidebar, source cards, and polished dark theme.

---

## Phase 6: GitHub Actions CI
**Goal:** Automated CI pipeline that runs lint, type-check, and build on every push and PR.

**Tasks:**
1. Create `.github/workflows/ci.yml` with GitHub Actions workflow
2. Run `npm run lint` step
3. Run `npx tsc --noEmit` type-check step
4. Run `npm run build` production build step
5. Configure workflow to trigger on push to `master` and on pull requests
6. Cache `node_modules` for faster CI runs

**Success:** Every push and PR triggers CI that catches lint errors, type errors, and build failures.

---

## Phase 7: Production Deployment Pipeline
**Goal:** Remove Anthropic dependency, switch to GPT-4o-mini, Dockerize app, extend CI/CD to auto-deploy to Hostinger VPS.

**Tasks:**
1. Switch LLM from Anthropic Claude to OpenAI GPT-4o-mini
2. Update system prompt — answer only from context, no web search
3. Create multi-stage Dockerfile + .dockerignore
4. Extend CI/CD pipeline with SSH deploy job to VPS
5. Set up GitHub Secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY)
6. Initial VPS setup — clone repo, create .env.local, test end-to-end

**Success:** Push to master triggers CI → deploy to VPS. App runs at VPS IP on port 3000.

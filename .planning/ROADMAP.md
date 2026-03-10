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

# Phase 3: Frontend — Chat UI Components

## Goal
Full interactive chat interface with streaming display.

## Success Criteria
- Full chat flow works — type question, see streamed markdown response
- Index selector switches between `devops-brain` and `claude-brain`
- Messages render with markdown formatting
- Auto-scroll to latest message during streaming

---

## Tasks

### Task 3.1: Create IndexSelector Component (`src/components/IndexSelector.tsx`)
**Action:** Dropdown to select Pinecone index (`devops-brain` / `claude-brain`).
**Verify:** Component renders, selection changes state.

### Task 3.2: Create ChatMessage Component (`src/components/ChatMessage.tsx`)
**Action:** Message bubble — user messages right-aligned, assistant messages left-aligned with markdown rendering via `react-markdown` + `remark-gfm`.
**Verify:** Both user and assistant messages render correctly with markdown.

### Task 3.3: Create ChatInput Component (`src/components/ChatInput.tsx`)
**Action:** Text input + send button. Calls parent handler on submit.
**Verify:** Input captures text, send button triggers callback.

### Task 3.4: Wire Main Page (`src/app/page.tsx`)
**Action:** Integrate all components with state management:
- Messages state array
- Streaming fetch to `/api/chat`
- Real-time message appending during stream
- Loading/typing indicator
- Auto-scroll to latest message
**Verify:** Full end-to-end chat flow works.

---

## Execution Order
Tasks 3.1, 3.2, 3.3 are independent — can be done in parallel.
Task 3.4 depends on all three.

Order: [3.1, 3.2, 3.3] → 3.4

## Verification
```bash
npm run build
```
Must succeed. Manual test: open browser, select index, type question, see streamed response.

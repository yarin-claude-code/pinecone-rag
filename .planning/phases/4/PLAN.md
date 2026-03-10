# Phase 4: Polish & Error Handling

## Goal
Production-ready app with graceful error UX, responsive layout, and visual polish.

## Already Done (from Phase 3)
- Enter to send, Shift+Enter for newlines (ChatInput)
- Disable send + index selector during streaming
- Basic error catch → shows error in chat bubble
- Empty Pinecone results → "No relevant context found." passed to Claude
- Typing indicator (bouncing dots)

## Remaining Tasks

### Task 4.1: Improve Error UX in Chat
**Action:** Style error messages distinctly from normal assistant messages — red/warning styling so errors are visually obvious. Currently errors just show as `Error: ...` in a normal assistant bubble.
**Files:** `src/components/ChatMessage.tsx`, `src/types/index.ts`
**Verify:** Trigger an error (e.g. bad API key) → see a visually distinct error message.

### Task 4.2: Textarea for Multi-line Input
**Action:** Replace `<input>` with `<textarea>` in ChatInput so Shift+Enter actually creates newlines. Current `<input type="text">` can't display multiple lines.
**Files:** `src/components/ChatInput.tsx`
**Verify:** Shift+Enter creates a new line in the input; Enter sends.

### Task 4.3: Responsive Design
**Action:** Make layout work well on mobile:
- Reduce padding/margins on small screens
- Full-width on mobile, max-w-3xl on desktop
- Adjust font sizes and bubble max-width for narrow viewports
**Files:** `src/app/page.tsx`, `src/components/ChatMessage.tsx`, `src/components/ChatInput.tsx`
**Verify:** Resize browser to mobile width — layout remains usable.

### Task 4.4: Visual Polish
**Action:** Final refinements:
- Smooth transitions on message appearance
- Better empty state (icon or illustration + subtitle)
- Subtle hover effects on interactive elements
- Consistent spacing throughout
**Files:** `src/app/page.tsx`, `src/app/globals.css`, components as needed
**Verify:** App looks polished, no jarring layout shifts.

---

## Execution Order
Tasks 4.1, 4.2, 4.3 are independent → can be done in parallel.
Task 4.4 goes last (builds on others).

Order: [4.1, 4.2, 4.3] → 4.4

## Verification
```bash
npm run build
```
Must succeed. Manual test: error states render distinctly, mobile layout works, multi-line input works.

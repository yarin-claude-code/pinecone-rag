# Phase 5 — Frontend Design Refactor

## Goal
Redesign the frontend to match the RAG Nexus reference design: left sidebar with navigation, polished chat with source cards, refined input bar, premium dark UI with purple/blue accent colors.

## Success Criteria
- Left sidebar with branding, "New Exploration" button, workspace nav, settings
- Chat header with conversation title + model badge
- User messages: right-aligned, purple/blue gradient
- Assistant messages: left-aligned with avatar, dark card, markdown rendering
- Sources & Context section with source cards showing relevance scores
- Action buttons (thumbs up/down, copy) + generation time
- Pill-shaped input bar with attachment, mic, send icons
- Footer disclaimer text
- Responsive: sidebar collapses on mobile

## Tasks (execution order)
1. Update types — add `sources` field to Message type
2. Update API route — return source metadata alongside streamed text
3. Create Sidebar component
4. Redesign layout (page.tsx) — sidebar + main content area
5. Redesign ChatMessage — user/assistant styles, avatar, source cards, action buttons
6. Redesign ChatInput — pill style with icons
7. Update globals.css — new color scheme (purple/blue accents)
8. Visual polish + responsive

## Color Palette (from reference)
- Background: #0d0f1a (deep dark navy)
- Sidebar: #111328
- Cards: #1a1d35
- Primary accent: #6c5ce7 (purple)
- Input accent: #5b4fcf
- User bubble: linear-gradient purple/blue
- Text: #e5e5e5, muted: #8888aa
- Badge: #2d2f4a with purple text

# Project State — Pinecone RAG Chat

## Current Phase
Phase 3 — Complete. Ready for Phase 4.

## Completed
- [x] Project idea captured (PROJECT.md)
- [x] Research: Pinecone SDK v7, OpenAI embeddings, Anthropic streaming, Next.js streaming
- [x] Requirements defined (REQUIREMENTS.md)
- [x] Roadmap created (ROADMAP.md) — 4 phases
- [x] CLAUDE.md created
- [x] Phase 1: Project scaffolding — Next.js 14, Tailwind dark theme, chat layout skeleton
- [x] Phase 2: Backend RAG API route — openai/pinecone/anthropic lib helpers + /api/chat streaming endpoint
- [x] Phase 3: Frontend chat UI — ChatMessage, ChatInput, IndexSelector components + streaming fetch + auto-scroll

## Decisions
- Node.js runtime (not Edge) — needed for Pinecone SDK
- `messages.stream()` high-level API for Anthropic streaming
- ReadableStream in Route Handler for SSE
- Standard Pinecone indexes with external OpenAI embeddings
- Raw text streaming (not SSE JSON format) — Claude chunks sent directly to client
- PineconeMetadata extends Record<string, string> to satisfy Pinecone SDK RecordMetadata constraint

## Blockers
None.

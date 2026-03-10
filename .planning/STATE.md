# Project State — Pinecone RAG Chat

## Current Phase
Phase 1 — Complete. Ready for Phase 2.

## Completed
- [x] Project idea captured (PROJECT.md)
- [x] Research: Pinecone SDK v7, OpenAI embeddings, Anthropic streaming, Next.js streaming
- [x] Requirements defined (REQUIREMENTS.md)
- [x] Roadmap created (ROADMAP.md) — 4 phases
- [x] CLAUDE.md created

## Decisions
- Node.js runtime (not Edge) — needed for Pinecone SDK
- `messages.stream()` high-level API for Anthropic streaming
- ReadableStream in Route Handler for SSE
- Standard Pinecone indexes with external OpenAI embeddings

## Blockers
None.

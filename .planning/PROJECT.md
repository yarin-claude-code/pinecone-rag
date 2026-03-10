# Pinecone RAG Chat

## Vision
Production-ready RAG chat web app that queries Pinecone vector indexes and streams Claude responses with a clean ChatGPT-style interface.

## Core Concept
User asks a question → OpenAI embeds it (text-embedding-3-small, 1536 dims) → Queries selected Pinecone index (top 5) → Extracts `metadata.text` → Sends context + question to Claude claude-sonnet-4-6 → Streams response back → Renders as markdown in chat UI.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS (minimal dark theme)
- **Vector DB:** Pinecone SDK v4+ (standard indexes, NOT integrated)
- **Embeddings:** OpenAI text-embedding-3-small (1536 dims)
- **LLM:** Anthropic Claude claude-sonnet-4-6 (streaming)
- **Markdown:** react-markdown + remark-gfm

## Pinecone Indexes
| Index | Domain | Metadata Schema |
|-------|--------|----------------|
| `devops-brain` | DevOps (AWS, GCP, K8s, Jenkins, Grafana) | `{ text: string, source: string }` |
| `claude-brain` | Claude/Anthropic docs | `{ text: string, source: string }` |

## API Design
- `POST /api/chat` — accepts `{ message, index, history }`, returns SSE stream

## Environment
- `OPENAI_API_KEY` — OpenAI embeddings
- `PINECONE_API_KEY` — Pinecone vector queries
- `ANTHROPIC_API_KEY` — Claude LLM responses

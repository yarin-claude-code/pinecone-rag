# Phase 2: Backend — RAG API Route

## Goal
`/api/chat` endpoint embeds user message, queries Pinecone, streams Claude response.

## Success Criteria
- `curl -X POST http://localhost:3000/api/chat` with valid payload returns streamed text
- Each lib module works independently with proper error handling
- TypeScript compiles cleanly (`npm run build`)

---

## Tasks

### Task 2.1: Create OpenAI Embedding Helper (`src/lib/openai.ts`)
**Action:** Implement `getEmbedding(text: string): Promise<number[]>` using `text-embedding-3-small`.
```ts
import OpenAI from "openai";

const openai = new OpenAI();

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
```
**Verify:** Module exports `getEmbedding` function, TypeScript compiles.

### Task 2.2: Create Pinecone Query Helper (`src/lib/pinecone.ts`)
**Action:** Implement `queryIndex(indexName: string, vector: number[], topK?: number)` returning context chunks.
```ts
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeMetadata } from "@/types";

const pc = new Pinecone();

export async function queryIndex(
  indexName: string,
  vector: number[],
  topK: number = 5
): Promise<string[]> {
  const index = pc.index<PineconeMetadata>(indexName);
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return results.matches
    .map((match) => match.metadata?.text)
    .filter((text): text is string => Boolean(text));
}
```
**Verify:** Module exports `queryIndex` function, TypeScript compiles.

### Task 2.3: Create Anthropic Streaming Helper (`src/lib/anthropic.ts`)
**Action:** Implement `streamChatResponse(systemPrompt: string, messages: Message[], onChunk: (text: string) => void): Promise<void>`.
```ts
import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@/types";

const anthropic = new Anthropic();

export async function streamChatResponse(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  stream.on("text", (text) => {
    onChunk(text);
  });

  await stream.finalMessage();
}
```
**Verify:** Module exports `streamChatResponse` function, TypeScript compiles.

### Task 2.4: Create API Route (`src/app/api/chat/route.ts`)
**Action:** POST handler that wires embedding → Pinecone query → Claude streaming → ReadableStream response.
```ts
import { NextRequest } from "next/server";
import { ChatRequest } from "@/types";
import { getEmbedding } from "@/lib/openai";
import { queryIndex } from "@/lib/pinecone";
import { streamChatResponse } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, index, history } = (await req.json()) as ChatRequest;

    // 1. Embed the user message
    const vector = await getEmbedding(message);

    // 2. Query Pinecone for relevant context
    const contextChunks = await queryIndex(index, vector);

    // 3. Build system prompt with context
    const context = contextChunks.length > 0
      ? contextChunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n\n")
      : "No relevant context found.";

    const systemPrompt = `You are a helpful assistant. Answer questions using the provided context. If the context doesn't contain relevant information, say so and answer based on your general knowledge.

Context:
${context}`;

    // 4. Stream Claude response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            ...history,
            { role: "user" as const, content: message },
          ];

          await streamChatResponse(systemPrompt, messages, (text) => {
            controller.enqueue(encoder.encode(text));
          });

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An error occurred";
          controller.enqueue(encoder.encode(`\n\n[Error: ${errorMessage}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Encoding": "none",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```
**Verify:** `npm run build` succeeds. Manual curl test returns streamed text.

---

## Execution Order
Tasks 2.1, 2.2, 2.3 are independent — can be done in parallel.
Task 2.4 depends on all three.

Order: [2.1, 2.2, 2.3] → 2.4

## Verification
```bash
npm run build
```
Must succeed with no TypeScript errors.

### Manual Test (with valid API keys in `.env.local`)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is vector search?","index":"devops-brain","history":[]}'
```
Should return streamed text response.

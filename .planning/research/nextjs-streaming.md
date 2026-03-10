# Next.js 14+ App Router Streaming Patterns

**Researched:** 2026-03-11
**Confidence:** HIGH (verified against official Next.js docs)

## 1. Streaming Route Handler (`app/api/chat/route.ts`)

### Pattern A: ReadableStream with `start` (simple, fire-and-forget)

Use when you have data ready or want to push chunks from an async source:

```typescript
// app/api/chat/route.ts
export const dynamic = "force-dynamic"; // prevent caching

export async function POST(req: Request) {
  const { messages } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Do your async work here - DO NOT await before returning the Response
      // The stream starts sending as chunks are enqueued
      for (const chunk of ["Hello", " ", "world", "!"]) {
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        await new Promise((r) => setTimeout(r, 100));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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
}
```

### Pattern B: Async Generator + `pull` (official Next.js pattern)

From the official docs -- uses an async iterator converted to a ReadableStream:

```typescript
// app/api/chat/route.ts
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function iteratorToStream(iterator: AsyncIterator<Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* generateResponse(messages: any[]): AsyncGenerator<Uint8Array> {
  // Replace with your actual LLM/data source
  const chunks = ["This ", "is ", "a ", "streamed ", "response."];
  for (const chunk of chunks) {
    yield encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    await new Promise((r) => setTimeout(r, 50));
  }
  yield encoder.encode("data: [DONE]\n\n");
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const iterator = generateResponse(messages);
  const stream = iteratorToStream(iterator);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

### Pattern C: Wrapping an external stream (e.g., OpenAI)

When your upstream API already returns a ReadableStream:

```typescript
// app/api/chat/route.ts
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const upstreamResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-4", messages, stream: true }),
  });

  // Pipe the upstream stream directly through
  return new Response(upstreamResponse.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
```

## 2. Required Headers

```typescript
const STREAMING_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "Content-Encoding": "none", // prevents gzip buffering on some proxies
};
```

- **`Content-Type: text/event-stream`** -- tells the browser this is an SSE stream
- **`Cache-Control: no-cache, no-transform`** -- prevents buffering/caching
- **`Connection: keep-alive`** -- keeps the connection open
- **`Content-Encoding: none`** -- critical on Vercel/proxies that apply gzip, which buffers chunks

Also export `dynamic = "force-dynamic"` to prevent Next.js from caching the route at build time.

## 3. ReadableStream + TextEncoder Pattern

```typescript
const encoder = new TextEncoder();

// SSE format: each message is "data: <content>\n\n"
controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

// Signal end of stream
controller.enqueue(encoder.encode("data: [DONE]\n\n"));
controller.close();
```

Key rules:
- Every SSE message must be prefixed with `data: ` and terminated with `\n\n`
- Use `JSON.stringify` for structured data
- Call `controller.close()` when done
- Call `controller.error(err)` on failure

## 4. Frontend Consumption

### Using fetch + ReadableStream reader

```typescript
"use client";
import { useState, useCallback } from "react";

export function useChat() {
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (messages: any[]) => {
    setResponse("");
    setIsStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) {
      setIsStreaming(false);
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let accumulated = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Parse SSE lines
      const lines = value.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.content;
            setResponse(accumulated);
          } catch {
            // Plain text, not JSON
            accumulated += data;
            setResponse(accumulated);
          }
        }
      }
    }

    setIsStreaming(false);
  }, []);

  return { response, isStreaming, sendMessage };
}
```

### Simpler variant (no SSE parsing, raw text stream)

If you skip SSE format and just stream raw text:

```typescript
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
let text = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  text += value;
  setResponse(text);
}
```

## 5. Edge Runtime vs Node.js Runtime

```typescript
// Opt into edge runtime
export const runtime = "edge";

// Or explicitly use Node.js (default)
export const runtime = "nodejs";
```

| Consideration | Edge Runtime | Node.js Runtime |
|---|---|---|
| **Cold start** | ~0ms (V8 isolates) | Slower (full Node process) |
| **Streaming support** | Native Web Streams API | Works, but historically buggier |
| **Node.js APIs** | NOT available (no `fs`, `child_process`, etc.) | Full access |
| **Max execution time (Vercel)** | 30s (hobby) / 5min (pro) | 10s (hobby) / 60s (pro) |
| **Bundle size limit** | 4MB on Vercel | No limit |
| **Best for** | Simple streaming proxies, stateless handlers | DB access, file I/O, heavy processing |

**Recommendation for RAG/chat streaming:**
- Use **Node.js runtime** (default). You likely need database access (Pinecone client, etc.) and the execution time limits are more forgiving.
- Edge is only worth it if your route is a pure pass-through proxy to an external LLM API with no server-side dependencies.

## Critical Gotcha: Buffering

**Problem:** Next.js waits for the handler function to resolve before sending the Response. If you `await` a long-running loop before `return new Response(stream)`, nothing streams -- it all arrives at once.

**Fix:** Return the Response immediately. The `start()` or `pull()` callbacks on ReadableStream run asynchronously after the Response is returned.

```typescript
// WRONG - buffers everything
export async function POST(req: Request) {
  const chunks: string[] = [];
  for await (const chunk of someAsyncSource()) {
    chunks.push(chunk); // buffering!
  }
  return new Response(chunks.join(""));
}

// CORRECT - streams as chunks arrive
export async function POST(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of someAsyncSource()) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: STREAMING_HEADERS });
}
```

## Handling Client Disconnect (AbortSignal)

```typescript
export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of someSource()) {
        if (req.signal.aborted) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAMING_HEADERS });
}
```

## Sources

- [Next.js Official Docs: Route Handlers (route.js)](https://nextjs.org/docs/app/api-reference/file-conventions/route) -- includes streaming example with async generators (HIGH confidence)
- [Upstash Blog: SSE Streaming LLM Responses in Next.js](https://upstash.com/blog/sse-streaming-llm-responses) -- full SSE implementation with frontend (MEDIUM confidence)
- [GitHub Discussion #50614: ReadableStream in API routes](https://github.com/vercel/next.js/discussions/50614) -- community patterns and gotchas (MEDIUM confidence)
- [Fixing Slow SSE Streaming in Next.js (2026)](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) -- buffering fix details (MEDIUM confidence)

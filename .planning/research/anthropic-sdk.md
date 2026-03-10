# Anthropic TypeScript SDK - Streaming Research

**Researched:** 2026-03-11
**Package:** `@anthropic-ai/sdk`
**Confidence:** HIGH (sourced from official Anthropic docs and SDK repo)

## 1. Client Initialization

```typescript
import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from environment automatically
const client = new Anthropic();

// Or pass explicitly
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

## 2. Streaming Methods

There are two approaches. Use `messages.stream()` (high-level) for almost all cases.

### High-Level: `messages.stream()` (RECOMMENDED)

Returns a `MessageStream` with event emitters, async iteration, and helper methods.

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: "You are a helpful assistant that answers questions about documents.",
  messages: [
    { role: "user", content: "What is RAG?" }
  ],
});
```

### Low-Level: `messages.create({ stream: true })`

Returns a raw `Stream<MessageStreamEvent>` async iterable. More control, less convenience.

```typescript
const stream = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  stream: true,
  system: "You are a helpful assistant.",
  messages: [
    { role: "user", content: "What is RAG?" }
  ],
});
```

## 3. Consuming the Stream

### Pattern A: `on("text")` event handler (simplest for real-time text)

```typescript
await client.messages
  .stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You are a helpful RAG assistant.",
    messages: [{ role: "user", content: userQuery }],
  })
  .on("text", (text) => {
    // `text` is the string delta (incremental chunk)
    process.stdout.write(text);
  });
```

### Pattern B: Async iteration over stream events

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: userQuery }],
});

for await (const event of stream) {
  // event.type is one of the SSE event types (see section 4)
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

### Pattern C: Get final message (streaming under the hood, no incremental output)

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 128000,
  messages: [{ role: "user", content: "Write a detailed analysis..." }],
});

const message = await stream.finalMessage();
const textBlock = message.content.find((block) => block.type === "text");
if (textBlock && textBlock.type === "text") {
  console.log(textBlock.text);
}
```

### Pattern D: `finalText()` shortcut

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: userQuery }],
});

const fullText = await stream.finalText();
```

### Pattern E: Low-level raw stream iteration

```typescript
const stream = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  stream: true,
  messages: [{ role: "user", content: userQuery }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}

// Cancel if needed:
// stream.controller.abort();
```

## 4. SSE Event Types

Stream event flow order:

1. **`message_start`** - Contains `Message` object with empty `content`
2. **`content_block_start`** - Start of a content block (index corresponds to final `content` array)
3. **`content_block_delta`** - One or more per block. Contains the incremental data:
   - `delta.type === "text_delta"` -> `delta.text` has the text chunk
   - `delta.type === "input_json_delta"` -> for tool use blocks
4. **`content_block_stop`** - Content block complete
5. **`message_delta`** - Top-level message changes (stop_reason, usage). Usage counts are cumulative.
6. **`message_stop`** - Stream complete
7. **`ping`** - Keepalive, can appear anytime
8. **`error`** - Error during stream (e.g. `overloaded_error`)

### Text delta structure (the one you care about most)

```
event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "ello frien"}}
```

### MessageStream Events (high-level SDK wrapper)

| Event | Description |
|-------|-------------|
| `connect` | API connection established |
| `streamEvent` | Every raw SSE event, plus accumulated message snapshot |
| `text` | Text delta arrived (provides delta string + full snapshot) |
| `inputJson` | JSON delta for tool use |
| `message` | Stream complete (message_stop) |
| `contentBlock` | Content block finished |
| `finalMessage` | After message, final accumulated result |
| `error` | Stream error |
| `abort` | Stream aborted |
| `end` | Last event in lifecycle |

## 5. System Prompt Handling

System prompt is a top-level parameter, NOT a message. Pass it as `system`:

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: "You are a RAG assistant. Use the following context to answer questions. If the context doesn't contain the answer, say so.",
  messages: [
    {
      role: "user",
      content: `Context:\n${retrievedChunks.join("\n\n")}\n\nQuestion: ${userQuestion}`
    }
  ],
});
```

System can also be an array of content blocks:

```typescript
system: [
  { type: "text", text: "You are a RAG assistant." },
  { type: "text", text: "Always cite your sources." }
]
```

## 6. Complete RAG Streaming Example

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function streamRAGResponse(
  query: string,
  contextChunks: string[],
  onChunk: (text: string) => void
): Promise<string> {
  const context = contextChunks
    .map((chunk, i) => `[${i + 1}] ${chunk}`)
    .join("\n\n");

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You are a helpful assistant. Answer questions using ONLY the provided context. Cite sources using [n] notation.",
    messages: [
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  });

  stream.on("text", (text) => {
    onChunk(text);
  });

  return await stream.finalText();
}

// Usage
const fullResponse = await streamRAGResponse(
  "What is vector search?",
  ["Vector search finds similar items by comparing embeddings..."],
  (chunk) => process.stdout.write(chunk)
);
```

## 7. Model Names

Use the string identifier directly:

- `"claude-sonnet-4-6"` - Claude Sonnet 4.6 (fast, capable)
- `"claude-opus-4-6"` - Claude Opus 4.6 (most capable)
- `"claude-haiku-3-5-20241022"` - Claude 3.5 Haiku (fastest, cheapest)

## 8. Error Handling

```typescript
try {
  const stream = client.messages.stream({ ... });

  stream.on("error", (error) => {
    console.error("Stream error:", error);
  });

  await stream.finalText();
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    console.error(error.status, error.message);
  }
}
```

## Sources

- [Anthropic Streaming Messages Docs](https://docs.anthropic.com/en/api/messages-streaming)
- [SDK helpers.md](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md)
- [SDK streaming example](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/examples/streaming.ts)
- [npm: @anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk)

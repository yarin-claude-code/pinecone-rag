# Requirements — Pinecone RAG Chat

## Functional Requirements

### FR-1: Chat Interface
- ChatGPT-style scrollable message history (user + assistant bubbles)
- Text input box + Send button at bottom
- Dropdown to select active Pinecone index (`devops-brain` | `claude-brain`)
- Loading/typing indicator during streaming
- Markdown rendering for assistant messages (react-markdown + remark-gfm)
- Responsive layout, minimal dark theme

### FR-2: RAG Pipeline (POST /api/chat)
- Accept `{ message: string, index: string, history: { role, content }[] }`
- Embed `message` with OpenAI `text-embedding-3-small` (1536 dims)
- Query selected Pinecone standard index — top 5 matches, `includeMetadata: true`
- Extract `metadata.text` from each match as context chunks
- Build system prompt with context chunks
- Stream Claude `claude-sonnet-4-6` response back to client

### FR-3: Streaming
- Backend: ReadableStream with SSE-style text chunks
- Frontend: fetch + ReadableStream reader, append chunks in real-time
- Proper headers: `Content-Type: text/event-stream`, no caching

### FR-4: Conversation History
- Send prior messages as `history` to API for multi-turn context
- Claude receives full conversation history for coherent follow-ups

## Non-Functional Requirements

### NFR-1: Error Handling
- Graceful handling of Pinecone failures, OpenAI failures, Anthropic failures
- User-visible error messages in chat on failure
- Empty Pinecone results → still answer (without context), note lack of sources

### NFR-2: Code Quality
- TypeScript throughout, strict mode
- Async/await, no callbacks
- Clear comments on important logic
- No unnecessary abstractions

### NFR-3: Environment
- All secrets via `.env.local` — never committed
- Works with `npm install && npm run dev`

## SDK Patterns (from research)

### Pinecone (v7.1.0)
```ts
const pc = new Pinecone(); // reads PINECONE_API_KEY from env
const index = pc.index<{ text: string; source: string }>('index-name');
const results = await index.query({ vector, topK: 5, includeMetadata: true });
// results.matches[i].metadata?.text
```

### OpenAI Embeddings
```ts
const openai = new OpenAI(); // reads OPENAI_API_KEY from env
const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
const vector = res.data[0].embedding; // number[1536]
```

### Anthropic Streaming
```ts
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const stream = anthropic.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  system: systemPrompt,
  messages: conversationHistory,
});
stream.on("text", (text) => { /* send chunk */ });
```

### Next.js Streaming Route
```ts
return new Response(new ReadableStream({
  async start(controller) {
    // push chunks via controller.enqueue()
    controller.close();
  }
}), { headers: { "Content-Type": "text/event-stream", ... } });
```

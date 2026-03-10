# Pinecone TypeScript SDK Research

**Package:** `@pinecone-database/pinecone`
**Latest Version:** v7.1.0
**Researched:** 2026-03-11
**Confidence:** HIGH (verified via official SDK docs at sdk.pinecone.io and docs.pinecone.io)

## 1. Import and Initialization

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

// Option A: Explicit API key
const pc = new Pinecone({ apiKey: 'YOUR_API_KEY' });

// Option B: Uses PINECONE_API_KEY env var automatically
const pc = new Pinecone();
```

## 2. Targeting an Index (Standard, Non-Integrated)

```typescript
// By name only (SDK resolves host automatically)
const index = pc.index('my-index');

// By name + explicit host (skips describe call, faster)
const index = pc.index('my-index', 'https://my-index-abc123.svc.environment.pinecone.io');
```

For a standard (non-integrated) index, you generate embeddings externally (e.g., OpenAI) and pass the raw vector to `query()`. There is no `searchRecords` or integrated inference involved.

## 3. Query Method Signature

```typescript
const queryResponse = await index.query({
  vector: [0.023, -0.032, ..., 0.008],  // your embedding float[]
  topK: 3,
  includeMetadata: true,
  includeValues: false,    // optional, default false
});
```

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `vector` | `number[]` | Yes (or `id`) | The query embedding vector |
| `id` | `string` | Yes (or `vector`) | Query by existing record ID instead of vector |
| `topK` | `number` | Yes | Number of results to return |
| `includeMetadata` | `boolean` | No | Return metadata with matches (default false) |
| `includeValues` | `boolean` | No | Return vector values with matches (default false) |
| `filter` | `object` | No | Metadata filter expression |

## 4. Namespace Usage

Namespaces are accessed by chaining `.namespace()` before the operation:

```typescript
// Query a specific namespace
const queryResponse = await index.namespace('my-namespace').query({
  vector: embedding,
  topK: 5,
  includeMetadata: true,
});

// Default namespace (empty string "") is used when .namespace() is omitted
const queryResponse = await index.query({
  vector: embedding,
  topK: 5,
  includeMetadata: true,
});
```

Namespaces are created implicitly on first upsert. No pre-creation needed.

## 5. Response Shape

```typescript
// queryResponse type:
{
  matches: [
    {
      id: string;
      score: number;            // similarity score (higher = more similar for cosine/dotproduct)
      values: number[];         // empty [] unless includeValues: true
      sparseValues?: object;
      metadata?: Record<string, any>;  // present if includeMetadata: true
    },
    // ... up to topK entries
  ],
  namespace: string;            // the namespace queried
  usage: { readUnits: number }; // billing info
}
```

## 6. Accessing Metadata (e.g., `metadata.text`)

```typescript
const queryResponse = await index.namespace('docs').query({
  vector: queryEmbedding,
  topK: 5,
  includeMetadata: true,
});

for (const match of queryResponse.matches) {
  console.log(match.id);                    // record ID
  console.log(match.score);                 // similarity score
  console.log(match.metadata?.text);        // your stored text field
  console.log(match.metadata?.category);    // any other metadata field
}
```

**Important:** The metadata field names depend entirely on what you stored during upsert. If you upserted with `metadata: { text: "..." }`, access it as `match.metadata.text`. Some examples use `chunk_text` instead -- it depends on your schema.

## 7. Full RAG Query Example

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone();  // uses PINECONE_API_KEY env
const openai = new OpenAI(); // uses OPENAI_API_KEY env
const index = pc.index('my-rag-index');

async function queryRAG(userQuestion: string) {
  // 1. Generate embedding for the question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userQuestion,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // 2. Query Pinecone
  const results = await index.namespace('documents').query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });

  // 3. Extract context text from matches
  const context = results.matches
    .map(match => match.metadata?.text as string)
    .filter(Boolean)
    .join('\n\n');

  return context;
}
```

## 8. TypeScript Generics for Metadata

The SDK supports generic type parameters for type-safe metadata:

```typescript
type DocMetadata = {
  text: string;
  source: string;
  page?: number;
};

const index = pc.index<DocMetadata>('my-index');

const results = await index.query({
  vector: embedding,
  topK: 5,
  includeMetadata: true,
});

// Now match.metadata is typed as DocMetadata
results.matches[0].metadata?.text;  // string, no cast needed
```

## Sources

- [Pinecone TypeScript SDK v7.1.0 docs](https://sdk.pinecone.io/typescript/)
- [Pinecone Semantic Search guide](https://docs.pinecone.io/guides/search/semantic-search)
- [Pinecone Namespaces guide](https://docs.pinecone.io/guides/indexes/using-namespaces)
- [GitHub: pinecone-ts-client](https://github.com/pinecone-io/pinecone-ts-client)

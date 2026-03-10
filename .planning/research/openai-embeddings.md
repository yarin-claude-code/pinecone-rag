# OpenAI Embeddings SDK Reference

**Package:** `openai` (npm)
**Researched:** 2026-03-11
**Confidence:** HIGH (official docs)

## Initialize Client

```typescript
import OpenAI from "openai";

// Reads OPENAI_API_KEY from environment automatically
const openai = new OpenAI();

// Or explicit:
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

## Generate Embeddings

```typescript
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text here",
  encoding_format: "float",
});

const vector: number[] = response.data[0].embedding;
// vector.length === 1536 for text-embedding-3-small default
```

## Batch Embeddings

```typescript
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: ["text one", "text two", "text three"],
  encoding_format: "float",
});

const vectors = response.data.map((item) => item.embedding);
// vectors[i] corresponds to input[i] (ordered by item.index)
```

## Response Shape

```typescript
interface CreateEmbeddingResponse {
  object: "list";
  data: Array<{
    object: "embedding";
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
```

## Key Parameters

| Parameter | Type | Notes |
|-----------|------|-------|
| `model` | string | Use `"text-embedding-3-small"` (1536 dims, cheapest) |
| `input` | string or string[] | Max 8192 tokens per input, max 2048 items in array |
| `encoding_format` | `"float"` or `"base64"` | Use `"float"` (default). `"base64"` for wire size optimization |
| `dimensions` | number | Optional. Truncate output dims (only text-embedding-3+). E.g., set 512 for smaller vectors |

## Model Comparison

| Model | Default Dimensions | Max Tokens | Cost |
|-------|-------------------|------------|------|
| text-embedding-3-small | 1536 | 8191 | Cheapest |
| text-embedding-3-large | 3072 | 8191 | 6x more |
| text-embedding-ada-002 | 1536 | 8191 | Legacy, avoid |

## Sources

- [OpenAI TypeScript Embeddings API Reference](https://developers.openai.com/api/reference/typescript/resources/embeddings/methods/create)
- [openai npm package](https://www.npmjs.com/package/openai)

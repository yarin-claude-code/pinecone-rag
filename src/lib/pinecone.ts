import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeMetadata, Source } from "@/types";

const pc = new Pinecone();

export interface QueryResult {
  texts: string[];
  sources: Source[];
}

export async function queryIndex(
  indexName: string,
  vector: number[],
  topK: number = 5
): Promise<QueryResult> {
  const index = pc.index<PineconeMetadata>(indexName);
  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  const texts: string[] = [];
  const sources: Source[] = [];

  for (const match of results.matches) {
    if (match.metadata?.text) {
      texts.push(match.metadata.text);
      sources.push({
        name: match.metadata.source || "Unknown",
        detail: match.metadata.text.slice(0, 80) + (match.metadata.text.length > 80 ? "..." : ""),
        score: Math.round((match.score ?? 0) * 100) / 100,
      });
    }
  }

  return { texts, sources };
}

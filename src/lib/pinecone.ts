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

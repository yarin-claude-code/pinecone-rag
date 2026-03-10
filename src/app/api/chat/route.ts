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
    const context =
      contextChunks.length > 0
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
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          controller.enqueue(
            encoder.encode(`\n\n[Error: ${errorMessage}]`)
          );
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
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { NextRequest } from "next/server";
import { ChatRequest } from "@/types";
import { getEmbedding } from "@/lib/openai";
import { queryIndex } from "@/lib/pinecone";
import { streamChatResponse } from "@/lib/openai";

export const dynamic = "force-dynamic";

const ALLOWED_INDEXES = ["devops-brain", "claude-brain"];
const MAX_HISTORY_MESSAGES = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, index, history } = body as ChatRequest;

    // Input validation
    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_INDEXES.includes(index)) {
      return new Response(
        JSON.stringify({ error: `Invalid index. Allowed: ${ALLOWED_INDEXES.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize history: filter out error messages, cap length, extract only role+content
    const sanitizedHistory = (Array.isArray(history) ? history : [])
      .filter((m) => m.role && m.content && !m.isError)
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }));

    // 1. Embed the user message
    const vector = await getEmbedding(message.trim());

    // 2. Query Pinecone for relevant context
    const { texts: contextChunks, sources } = await queryIndex(index, vector);

    // 3. Build system prompt with context
    const context =
      contextChunks.length > 0
        ? contextChunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join("\n\n")
        : "No relevant context found.";

    const systemPrompt = `You are a friendly knowledge base assistant. Answer questions ONLY using the provided context below. Do NOT use any outside knowledge or search the web.

If the context does not contain enough information to answer the question, respond with a kind message like: "I couldn't find anything about that in the knowledge base. Try rephrasing your question or searching for a different topic — I'm here to help!"

Context:
${context}`;

    // 4. Stream response with abort signal support
    const abortSignal = req.signal;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (abortSignal.aborted) {
            controller.close();
            return;
          }

          const messages = [
            ...sanitizedHistory,
            { role: "user" as const, content: message.trim() },
          ];

          await streamChatResponse(systemPrompt, messages, (text) => {
            if (abortSignal.aborted) return;
            controller.enqueue(encoder.encode(text));
          });

          // Append sources as a JSON trailer separated by a delimiter
          if (sources.length > 0 && !abortSignal.aborted) {
            controller.enqueue(
              encoder.encode(`\n<!--SOURCES:${JSON.stringify(sources)}-->`)
            );
          }

          controller.close();
        } catch (error) {
          if (abortSignal.aborted) {
            controller.close();
            return;
          }
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

import OpenAI from "openai";
import { Message } from "@/types";

const openai = new OpenAI();

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function streamChatResponse(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      onChunk(text);
    }
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { Message } from "@/types";

const anthropic = new Anthropic();

export async function streamChatResponse(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  stream.on("text", (text) => {
    onChunk(text);
  });

  await stream.finalMessage();
}

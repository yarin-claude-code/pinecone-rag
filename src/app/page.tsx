"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import IndexSelector from "@/components/IndexSelector";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState("devops-brain");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(content: string) {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          index,
          history: messages,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const text = accumulated;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: text },
        ]);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An error occurred";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Error: ${errorMsg}`, isError: true },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[#2a2a2a]">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight">
          Pinecone RAG Chat
        </h1>
        <IndexSelector
          value={index}
          onChange={setIndex}
          disabled={isStreaming}
        />
      </header>

      <main className="flex-1 overflow-y-auto p-3 sm:p-4">
        {messages.length === 0 ? (
          <div className="text-center mt-20">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-[#525252] text-sm">
              Ask a question to get started
            </p>
            <p className="text-[#3a3a3a] text-xs mt-1">
              Select an index above, then type your question below
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start mb-4">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#525252] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-[#525252] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#525252] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="px-3 sm:px-4 py-3 border-t border-[#2a2a2a]">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </footer>
    </div>
  );
}

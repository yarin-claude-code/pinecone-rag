"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Source } from "@/types";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import IndexSelector from "@/components/IndexSelector";
import Sidebar from "@/components/Sidebar";

function parseSources(text: string): { content: string; sources: Source[] } {
  const match = text.match(/\n<!--SOURCES:(.*?)-->$/);
  if (!match) return { content: text, sources: [] };
  try {
    const sources = JSON.parse(match[1]) as Source[];
    return { content: text.slice(0, match.index!), sources };
  } catch {
    return { content: text, sources: [] };
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState("devops-brain");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleNewChat() {
    if (!isStreaming) setMessages([]);
  }

  async function handleSend(content: string) {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const startTime = Date.now();

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
        const { content: displayText, sources } = parseSources(accumulated);
        const genTime = (Date.now() - startTime) / 1000;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: displayText,
            sources: sources.length > 0 ? sources : undefined,
            generationTime: genTime,
          },
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
    <div className="flex h-screen bg-[#0d0f1a]">
      <Sidebar onNewChat={handleNewChat} currentIndex={index} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#1e2044]">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#e5e5e5] tracking-tight">
              {index === "devops-brain" ? "DevOps Knowledge Base" : "Claude Knowledge Base"}
            </h1>
            <span className="text-[10px] font-medium text-[#6c5ce7] bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Claude Sonnet
            </span>
          </div>
          <div className="flex items-center gap-3">
            <IndexSelector
              value={index}
              onChange={setIndex}
              disabled={isStreaming}
            />
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#5b4fcf]/10 border border-[#2d2f4a] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <p className="text-[#8888aa] text-sm font-medium">
                Start a new exploration
              </p>
              <p className="text-[#444466] text-xs mt-1.5">
                Ask a question to search your knowledge base
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#5b4fcf] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4" />
                    </svg>
                  </div>
                  <div className="bg-[#1a1d35] border border-[#2d2f4a] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-[#6c5ce7] rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-[#6c5ce7] rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-[#6c5ce7] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <footer className="px-4 sm:px-6 py-4 border-t border-[#1e2044]">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          </div>
        </footer>
      </div>
    </div>
  );
}

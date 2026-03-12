"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, Source, Conversation } from "@/types";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import IndexSelector from "@/components/IndexSelector";
import Sidebar from "@/components/Sidebar";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseSources(text: string): { content: string; sources: Source[] } {
  const match = text.match(/\n<!--SOURCES:([\s\S]*?)-->$/);
  if (!match) return { content: text, sources: [] };
  try {
    const sources = JSON.parse(match[1]) as Source[];
    return { content: text.slice(0, match.index!), sources };
  } catch {
    return { content: text, sources: [] };
  }
}

function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem("rag-nexus-conversations");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem("rag-nexus-conversations", JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState("devops-brain");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = loadConversations();
    setConversations(saved);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save current conversation to localStorage whenever messages change
  const saveCurrentConversation = useCallback(
    (msgs: Message[]) => {
      if (msgs.length === 0) return;

      setConversations((prev) => {
        let updated: Conversation[];
        if (activeConversationId) {
          updated = prev.map((c) =>
            c.id === activeConversationId
              ? { ...c, messages: msgs, updatedAt: Date.now() }
              : c
          );
        } else {
          const newConvo: Conversation = {
            id: generateId(),
            title: msgs[0].content.slice(0, 50) + (msgs[0].content.length > 50 ? "..." : ""),
            index,
            messages: msgs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updated = [newConvo, ...prev];
          setActiveConversationId(newConvo.id);
        }
        saveConversations(updated);
        return updated;
      });
    },
    [activeConversationId, index]
  );

  function handleNewChat() {
    if (isStreaming) return;
    setMessages([]);
    setActiveConversationId(null);
  }

  function handleSelectConversation(id: string) {
    if (isStreaming) return;
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setMessages(convo.messages);
      setIndex(convo.index);
      setActiveConversationId(id);
    }
  }

  function handleDeleteConversation(id: string) {
    if (isStreaming) return;
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(null);
    }
  }

  function handleCancelStream() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  async function handleSend(content: string) {
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const startTime = Date.now();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          index,
          history: messages.filter((m) => !m.isError),
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";
      let finalMessages: Message[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const { content: displayText, sources } = parseSources(accumulated);
        const genTime = (Date.now() - startTime) / 1000;
        const updatedMsg: Message = {
          role: "assistant",
          content: displayText,
          sources: sources.length > 0 ? sources : undefined,
          generationTime: genTime,
        };
        setMessages((prev) => {
          finalMessages = [...prev.slice(0, -1), updatedMsg];
          return finalMessages;
        });
      }

      // Save after streaming completes
      if (finalMessages.length > 0) {
        saveCurrentConversation(finalMessages);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // User cancelled — keep whatever was streamed so far
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            // Nothing was streamed, remove empty placeholder
            const cleaned = prev.slice(0, -1);
            if (cleaned.length > 0) saveCurrentConversation(cleaned);
            return cleaned;
          }
          const genTime = (Date.now() - startTime) / 1000;
          const final = [
            ...prev.slice(0, -1),
            { ...last, generationTime: genTime },
          ];
          saveCurrentConversation(final);
          return final;
        });
      } else {
        const errorMsg =
          error instanceof Error ? error.message : "An error occurred";
        setMessages((prev) => {
          const final = [
            ...prev.slice(0, -1),
            { role: "assistant" as const, content: `Error: ${errorMsg}`, isError: true },
          ];
          saveCurrentConversation(final);
          return final;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  return (
    <div className="flex h-screen bg-[#0d0f1a]">
      <Sidebar
        onNewChat={handleNewChat}
        currentIndex={index}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#1e2044]">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#e5e5e5] tracking-tight">
              {index === "devops-brain" ? "DevOps Knowledge Base" : "Claude Knowledge Base"}
            </h1>
            <span className="text-[10px] font-medium text-[#6c5ce7] bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
              GPT-4o mini
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
            <ChatInput
              onSend={handleSend}
              onCancel={handleCancelStream}
              disabled={isStreaming}
              isStreaming={isStreaming}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

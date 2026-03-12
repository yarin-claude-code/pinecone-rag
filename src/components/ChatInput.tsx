"use client";

import { useRef, useState, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export default function ChatInput({ onSend, onCancel, disabled, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Escape key to cancel streaming
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isStreaming) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStreaming, onCancel]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "44px";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  }

  function resetHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "44px";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    resetHeight();
  }

  function handleKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 bg-[#1a1d35] border border-[#2d2f4a] rounded-2xl px-2 py-1.5 focus-within:border-[#6c5ce7]/50 transition-colors"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDownInput}
          placeholder="Search your knowledge base..."
          disabled={disabled}
          style={{ height: "40px" }}
          className="flex-1 min-w-0 bg-transparent text-[#e5e5e5] placeholder-[#555577] text-sm outline-none resize-none overflow-hidden py-2.5 px-3 disabled:opacity-50"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/20 text-red-400 cursor-pointer transition-all hover:bg-red-500/30 shrink-0"
            aria-label="Cancel generation"
            title="Cancel (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#5b4fcf] text-white cursor-pointer transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </form>

      <p className="text-center text-[10px] text-[#444466] mt-2.5">
        RAG Nexus uses vector search to retrieve relevant documents before generation. Accuracy depends on the indexed context.
      </p>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  function handleKeyDown(e: React.KeyboardEvent) {
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
        {/* Attachment icon */}
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-[#555577] hover:text-[#8888aa] transition-colors shrink-0"
          aria-label="Attach file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search your knowledge base..."
          disabled={disabled}
          style={{ height: "40px" }}
          className="flex-1 min-w-0 bg-transparent text-[#e5e5e5] placeholder-[#555577] text-sm outline-none resize-none overflow-hidden py-2.5 disabled:opacity-50"
        />

        {/* Mic icon */}
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-[#555577] hover:text-[#8888aa] transition-colors shrink-0"
          aria-label="Voice input"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Send button */}
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
      </form>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-[#444466] mt-2.5">
        RAG Nexus uses vector search to retrieve relevant documents before generation. Accuracy depends on the indexed context.
      </p>
    </div>
  );
}

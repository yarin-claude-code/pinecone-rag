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
    el.style.height = "40px";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  }

  function resetHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "40px";
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        style={{ height: "40px" }}
        className="flex-1 min-w-0 bg-[#171717] border border-[#2a2a2a] rounded-lg px-3 sm:px-4 py-2.5 text-[#e5e5e5] placeholder-[#525252] text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors duration-150 disabled:opacity-50 resize-none overflow-hidden"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a0a0a] cursor-pointer transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        aria-label="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  );
}

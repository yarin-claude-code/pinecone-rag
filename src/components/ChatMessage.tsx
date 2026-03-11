"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copiedIndex, setCopiedIndex] = useState<"content" | null>(null);

  function copyContent() {
    navigator.clipboard.writeText(message.content);
    setCopiedIndex("content");
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-5 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed bg-gradient-to-r from-[#6c5ce7] to-[#5b4fcf] text-white">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3 mb-5 animate-fade-in">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#5b4fcf] flex items-center justify-center shrink-0 mt-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </div>

      <div className="max-w-[85%] sm:max-w-[75%] space-y-3">
        {/* Message content */}
        <div
          className={`rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed ${
            message.isError
              ? "bg-red-900/30 text-red-200 border border-red-800/50"
              : "bg-[#1a1d35] text-[#e5e5e5] border border-[#2d2f4a]"
          }`}
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:bg-[#0d0f1a] prose-pre:border prose-pre:border-[#2d2f4a] prose-code:text-[#a78bfa]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-[#6c5ce7]/20 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-[#555577] tracking-widest uppercase">Sources & Context</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-[#1a1d35] border border-[#2d2f4a] rounded-xl px-3 py-2.5 min-w-[200px] max-w-[280px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2d2f4a] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#e5e5e5] truncate">{src.name}</div>
                    <div className="text-[10px] text-[#555577] truncate">{src.detail}</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 px-1.5 py-0.5 rounded-full shrink-0">
                    {src.score.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!message.isError && message.content && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md text-[#555577] hover:text-[#8888aa] hover:bg-[#1a1d35] transition-colors" aria-label="Thumbs up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>
              <button className="p-1.5 rounded-md text-[#555577] hover:text-[#8888aa] hover:bg-[#1a1d35] transition-colors" aria-label="Thumbs down">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              </button>
              <button
                onClick={copyContent}
                className="p-1.5 rounded-md text-[#555577] hover:text-[#8888aa] hover:bg-[#1a1d35] transition-colors"
                aria-label="Copy"
              >
                {copiedIndex === "content" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            {message.generationTime && (
              <span className="text-[10px] text-[#444466] ml-auto">
                Generation {message.generationTime.toFixed(1)}s
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

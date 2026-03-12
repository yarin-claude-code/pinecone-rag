"use client";

import { useState } from "react";
import { Conversation } from "@/types";

interface SidebarProps {
  onNewChat: () => void;
  currentIndex: string;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
  onNewChat,
  currentIndex,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1d35] border border-[#2d2f4a] text-[#8888aa] hover:text-[#e5e5e5] transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed md:relative z-40 h-screen w-[240px] bg-[#111328] border-r border-[#1e2044] flex flex-col transition-transform duration-200 ${
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        }`}
      >
        {/* Branding */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#5b4fcf] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-[#e5e5e5] tracking-tight">RAG Nexus</div>
            <div className="text-[10px] font-semibold text-[#6c5ce7] tracking-widest uppercase">Vector Engine</div>
          </div>
        </div>

        {/* New Exploration button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              onNewChat();
              setCollapsed(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#6c5ce7] to-[#5b4fcf] text-white text-sm font-medium hover:brightness-110 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Exploration
          </button>
        </div>

        {/* Conversation history */}
        <div className="px-4 mb-2 flex-1 overflow-y-auto min-h-0">
          <div className="text-[10px] font-semibold text-[#555577] tracking-widest uppercase mb-2">History</div>
          {conversations.length === 0 ? (
            <p className="text-[11px] text-[#444466] px-2">No conversations yet</p>
          ) : (
            <nav className="space-y-0.5">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`group flex items-center gap-1 rounded-lg text-sm cursor-pointer transition-colors ${
                    activeConversationId === convo.id
                      ? "bg-[#1a1d35] text-[#e5e5e5]"
                      : "text-[#8888aa] hover:bg-[#1a1d35] hover:text-[#e5e5e5]"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectConversation(convo.id);
                      setCollapsed(true);
                    }}
                    className="flex-1 text-left px-3 py-2 truncate text-xs"
                    title={convo.title}
                  >
                    {convo.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(convo.id);
                    }}
                    className="p-1.5 rounded-md text-[#555577] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1"
                    aria-label="Delete conversation"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Current index indicator */}
        <div className="px-4 mb-2">
          <div className="px-3 py-2 rounded-lg bg-[#1a1d35] text-xs text-[#8888aa]">
            <span className="text-[#555577]">Index:</span> <span className="text-[#6c5ce7]">{currentIndex}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

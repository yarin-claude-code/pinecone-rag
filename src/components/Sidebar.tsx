"use client";

import { useState } from "react";

interface SidebarProps {
  onNewChat: () => void;
  currentIndex: string;
}

export default function Sidebar({ onNewChat, currentIndex }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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

        {/* Workspace nav */}
        <div className="px-4 mb-2">
          <div className="text-[10px] font-semibold text-[#555577] tracking-widest uppercase mb-2">Workspace</div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#1a1d35] hover:text-[#e5e5e5] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Knowledge Base
            </a>
            <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#1a1d35] hover:text-[#e5e5e5] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </a>
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current index indicator */}
        <div className="px-4 mb-2">
          <div className="px-3 py-2 rounded-lg bg-[#1a1d35] text-xs text-[#8888aa]">
            <span className="text-[#555577]">Index:</span> <span className="text-[#6c5ce7]">{currentIndex}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="px-4 pb-5">
          <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#1a1d35] hover:text-[#e5e5e5] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </a>
        </div>
      </aside>
    </>
  );
}

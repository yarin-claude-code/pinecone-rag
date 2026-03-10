# Phase 1: Project Scaffolding

## Goal
Next.js 14 app boots with Tailwind dark theme, empty chat layout renders.

## Success Criteria
- `npm run dev` starts without errors
- Browser shows dark-themed page with chat layout skeleton
- All TypeScript types compile cleanly
- Project structure matches CLAUDE.md spec

---

## Tasks

### Task 1.1: Initialize Next.js 14 Project
**Action:** Run `npx create-next-app@14` with App Router, TypeScript, Tailwind, `src/` directory, ESLint.
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"
```
**Verify:** `npm run dev` starts on localhost:3000.

### Task 1.2: Install Dependencies
**Action:** Install required packages.
```bash
npm install @pinecone-database/pinecone openai @anthropic-ai/sdk react-markdown remark-gfm
```
**Verify:** All packages in `package.json`.

### Task 1.3: Configure Tailwind Dark Theme
**Action:** Edit `src/app/globals.css` — strip defaults, set dark background/text as base styles.
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-gray-100;
  }
}
```
**Verify:** Page renders with dark background.

### Task 1.4: Create Root Layout
**Action:** Edit `src/app/layout.tsx` — set metadata (title: "Pinecone RAG Chat"), dark body class, Inter font.
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pinecone RAG Chat",
  description: "RAG chat powered by Pinecone and Claude",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Task 1.5: Create Chat Layout Skeleton (page.tsx)
**Action:** Edit `src/app/page.tsx` — full-height flex layout with header, message area, input placeholder.
```tsx
export default function Home() {
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Pinecone RAG Chat</h1>
        {/* IndexSelector placeholder */}
        <div className="text-sm text-gray-400">Select index ▾</div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-gray-500 text-center mt-20">Ask a question to get started</p>
      </main>

      {/* Input area */}
      <footer className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" disabled>
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
```

### Task 1.6: Create Shared TypeScript Types
**Action:** Create `src/types/index.ts`.
```ts
export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  index: string;
  history: Message[];
}

export interface PineconeMetadata {
  text: string;
  source: string;
}
```

### Task 1.7: Create Environment Template
**Action:** Create `.env.local.example` with required keys.
```
OPENAI_API_KEY=
PINECONE_API_KEY=
ANTHROPIC_API_KEY=
```
**Verify:** `.gitignore` includes `.env.local`.

### Task 1.8: Create Empty Lib Files (Stubs)
**Action:** Create placeholder files for Phase 2:
- `src/lib/pinecone.ts` — empty export
- `src/lib/openai.ts` — empty export
- `src/lib/anthropic.ts` — empty export

Each file: `// Implemented in Phase 2`

---

## Execution Order
All tasks are sequential: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8

## Verification
```bash
npm run dev
npm run build
```
Both must succeed. Browser at localhost:3000 shows dark chat layout.

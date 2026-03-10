export default function Home() {
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <h1 className="text-lg font-semibold tracking-tight">Pinecone RAG Chat</h1>
        <select
          className="bg-[#171717] text-sm text-[#a3a3a3] border border-[#2a2a2a] rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
          disabled
        >
          <option>devops-brain</option>
          <option>claude-brain</option>
        </select>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <p className="text-[#525252] text-center mt-20 text-sm">
          Ask a question to get started
        </p>
      </main>

      <footer className="px-4 py-3 border-t border-[#2a2a2a]">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-[#171717] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-[#e5e5e5] placeholder-[#525252] text-sm outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors duration-150"
            disabled
          />
          <button
            className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#0a0a0a] font-medium px-5 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

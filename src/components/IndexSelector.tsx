"use client";

const INDEXES = ["devops-brain", "claude-brain"];

interface IndexSelectorProps {
  value: string;
  onChange: (index: string) => void;
  disabled?: boolean;
}

export default function IndexSelector({ value, onChange, disabled }: IndexSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="bg-[#171717] text-sm text-[#a3a3a3] border border-[#2a2a2a] rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer transition-colors duration-150 hover:border-[#3a3a3a] disabled:opacity-50"
    >
      {INDEXES.map((idx) => (
        <option key={idx} value={idx}>
          {idx}
        </option>
      ))}
    </select>
  );
}

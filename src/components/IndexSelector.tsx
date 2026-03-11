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
      className="bg-[#1a1d35] text-sm text-[#8888aa] border border-[#2d2f4a] rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 cursor-pointer transition-colors hover:border-[#3d3f5a] disabled:opacity-50"
    >
      {INDEXES.map((idx) => (
        <option key={idx} value={idx}>
          {idx}
        </option>
      ))}
    </select>
  );
}

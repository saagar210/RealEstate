import { useState } from "react";
import { X } from "lucide-react";

interface KeywordInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  disabled?: boolean;
}

export function KeywordInput({ value, onChange, disabled }: KeywordInputProps) {
  const [input, setInput] = useState("");

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeKeyword = (keyword: string) => {
    onChange(value.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeKeyword(value[value.length - 1]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        SEO Keywords
      </label>
      <div
        className={`flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-200 min-h-[42px] ${
          disabled ? "opacity-50 bg-gray-50" : "bg-white"
        }`}
      >
        {value.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {keyword}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="hover:text-blue-600"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addKeyword(input)}
          disabled={disabled}
          placeholder={value.length === 0 ? "e.g., waterfront, downtown Seattle" : ""}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add</p>
    </div>
  );
}

import type { ListingLength } from "@/lib/types";

const LENGTHS: { value: ListingLength; label: string; words: string }[] = [
  { value: "short", label: "Short", words: "100-150 words" },
  { value: "medium", label: "Medium", words: "200-300 words" },
  { value: "long", label: "Long", words: "400-500 words" },
];

interface LengthSelectorProps {
  value: ListingLength;
  onChange: (value: ListingLength) => void;
  disabled?: boolean;
}

export function LengthSelector({ value, onChange, disabled }: LengthSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
      <div className="flex gap-2">
        {LENGTHS.map((length) => {
          const selected = value === length.value;
          return (
            <button
              key={length.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(length.value)}
              className={`flex-1 p-3 rounded-lg border transition-colors text-sm text-center ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="font-medium">{length.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{length.words}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

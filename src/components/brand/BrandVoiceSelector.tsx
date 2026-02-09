import type { BrandVoice } from "@/lib/types";

interface BrandVoiceSelectorProps {
  voices: BrandVoice[];
  value: string | null;
  onChange: (voiceId: string | null) => void;
  disabled?: boolean;
}

export function BrandVoiceSelector({
  voices,
  value,
  onChange,
  disabled,
}: BrandVoiceSelectorProps) {
  if (voices.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Brand Voice
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">No brand voice</option>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
}

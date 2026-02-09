import { Briefcase, Heart, Zap } from "lucide-react";
import type { ListingTone } from "@/lib/types";

const TONES: { value: ListingTone; label: string; description: string; icon: typeof Briefcase }[] = [
  { value: "professional", label: "Professional", description: "Authoritative, polished, measured", icon: Briefcase },
  { value: "warm", label: "Warm", description: "Conversational, inviting, sensory details", icon: Heart },
  { value: "exciting", label: "Exciting", description: "High energy, dynamic, aspirational", icon: Zap },
];

interface ToneSelectorProps {
  value: ListingTone;
  onChange: (value: ListingTone) => void;
  disabled?: boolean;
}

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
      <div className="flex gap-2">
        {TONES.map((tone) => {
          const Icon = tone.icon;
          const selected = value === tone.value;
          return (
            <button
              key={tone.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tone.value)}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors text-sm ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon size={16} className={selected ? "text-blue-600" : "text-gray-400"} />
              <span className="font-medium">{tone.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

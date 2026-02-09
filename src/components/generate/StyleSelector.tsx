import { Crown, Users, TrendingUp, Home } from "lucide-react";
import type { ListingStyle } from "@/lib/types";

const STYLES: { value: ListingStyle; label: string; description: string; icon: typeof Crown }[] = [
  { value: "luxury", label: "Luxury", description: "Sophisticated, aspirational language for affluent buyers", icon: Crown },
  { value: "family", label: "Family-Friendly", description: "Warm, practical focus on space, schools, community", icon: Users },
  { value: "investment", label: "Investment", description: "Data-driven, ROI-focused for investors", icon: TrendingUp },
  { value: "first_time", label: "First-Time Buyer", description: "Encouraging, value-focused for new buyers", icon: Home },
];

interface StyleSelectorProps {
  value: ListingStyle;
  onChange: (value: ListingStyle) => void;
  disabled?: boolean;
}

export function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((style) => {
          const Icon = style.icon;
          const selected = value === style.value;
          return (
            <button
              key={style.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(style.value)}
              className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-colors text-sm ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon size={16} className={`mt-0.5 shrink-0 ${selected ? "text-blue-600" : "text-gray-400"}`} />
              <div>
                <div className="font-medium">{style.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{style.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

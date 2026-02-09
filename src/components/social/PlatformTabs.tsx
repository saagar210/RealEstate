import { Camera, ThumbsUp, Briefcase } from "lucide-react";
import type { SocialPlatform } from "@/lib/types";

interface PlatformTabsProps {
  value: SocialPlatform;
  onChange: (platform: SocialPlatform) => void;
  disabled?: boolean;
}

const platforms: { id: SocialPlatform; label: string; icon: typeof Camera }[] = [
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "facebook", label: "Facebook", icon: ThumbsUp },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
];

export function PlatformTabs({ value, onChange, disabled }: PlatformTabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {platforms.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            value === id
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}

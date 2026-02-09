import { useState, type ReactNode } from "react";
import { Copy, Check, Camera, ThumbsUp, Briefcase, AlertTriangle } from "lucide-react";
import type { SocialPlatform } from "@/lib/types";

interface SocialPostCardProps {
  postNumber: number;
  content: string;
  platform: SocialPlatform;
}

const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
};

const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; icon: typeof Camera; color: string }> = {
  instagram: { label: "Instagram", icon: Camera, color: "bg-pink-100 text-pink-700" },
  facebook: { label: "Facebook", icon: ThumbsUp, color: "bg-blue-100 text-blue-700" },
  linkedin: { label: "LinkedIn", icon: Briefcase, color: "bg-sky-100 text-sky-700" },
};

function highlightHashtags(text: string): ReactNode[] {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <span key={i} className="text-blue-600 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function SocialPostCard({ postNumber, content, platform }: SocialPostCardProps) {
  const [copied, setCopied] = useState(false);
  const charCount = content.length;
  const limit = PLATFORM_LIMITS[platform];
  const isOverLimit = charCount > limit;
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon size={12} />
            {config.label}
          </span>
          <span className="text-xs text-gray-400">Post {postNumber}</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {highlightHashtags(content)}
        </p>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <span className={`text-xs ${isOverLimit ? "text-red-600 font-medium" : "text-gray-400"}`}>
          {charCount.toLocaleString()} / {limit.toLocaleString()} characters
        </span>
        {isOverLimit && (
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle size={12} />
            Over limit by {(charCount - limit).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}

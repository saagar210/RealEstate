import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

interface StreamingOutputProps {
  text: string;
  isGenerating: boolean;
  error: string | null;
  onRegenerate?: () => void;
}

export function StreamingOutput({
  text,
  isGenerating,
  error,
  onRegenerate,
}: StreamingOutputProps) {
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700 font-medium">Generation failed</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!text && !isGenerating) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Select your preferences and click Generate to create a listing description.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-4 min-h-[200px]">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {text}
          {isGenerating && (
            <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse" />
          )}
        </p>
      </div>
      {(text || isGenerating) && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <span className="text-xs text-gray-400">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <div className="flex items-center gap-2">
            {onRegenerate && !isGenerating && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
            )}
            {text && !isGenerating && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

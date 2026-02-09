import { Star, Trash2, Loader2 } from "lucide-react";
import type { Listing } from "@/lib/types";

interface GenerationHistoryProps {
  generations: Listing[];
  isLoading: boolean;
  onSelect: (listing: Listing) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GenerationHistory({
  generations,
  isLoading,
  onSelect,
  onToggleFavorite,
  onDelete,
}: GenerationHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No previous generations yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">History</h3>
      {generations.map((gen) => {
        const date = new Date(gen.createdAt);
        const timeStr = date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const preview =
          gen.content.length > 80
            ? gen.content.slice(0, 80) + "..."
            : gen.content;

        return (
          <div
            key={gen.id}
            className="group flex items-start gap-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelect(gen)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">{timeStr}</span>
                {gen.style && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {gen.style}
                  </span>
                )}
                {gen.tone && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {gen.tone}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{preview}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(gen.id);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title={gen.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  size={14}
                  className={
                    gen.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(gen.id);
                }}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

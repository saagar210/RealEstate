import { convertFileSrc } from "@tauri-apps/api/core";
import { Trash2, Star, Loader2 } from "lucide-react";
import type { Photo } from "@/lib/types";

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function PhotoGrid({ photos, isLoading, onDelete }: PhotoGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        >
          <img
            src={convertFileSrc(photo.thumbnailPath)}
            alt={photo.filename}
            className="w-full aspect-[3/2] object-cover"
            loading="lazy"
          />

          {/* Primary badge */}
          {index === 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded">
              <Star size={10} fill="currentColor" />
              Primary
            </div>
          )}

          {/* Filename overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
            <p className="text-xs text-white truncate">{photo.filename}</p>
          </div>

          {/* Delete button - visible on hover */}
          <button
            onClick={() => void onDelete(photo.id)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Delete photo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

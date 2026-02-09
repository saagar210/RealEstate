import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, ImagePlus } from "lucide-react";

interface PhotoUploaderProps {
  photoCount: number;
  isImporting: boolean;
  onImport: () => Promise<void>;
}

const MAX_PHOTOS = 20;

export function PhotoUploader({
  photoCount,
  isImporting,
  onImport,
}: PhotoUploaderProps) {
  const remaining = MAX_PHOTOS - photoCount;
  const isFull = remaining <= 0;

  const onDrop = useCallback(() => {
    // The actual file selection happens via Tauri's native dialog,
    // so we just trigger the import command on any drop/click interaction
    if (!isFull && !isImporting) {
      void onImport();
    }
  }, [isFull, isImporting, onImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false,
    // We don't actually use the dropped files — Tauri's native dialog handles selection
    noDrag: false,
  });

  if (isFull) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
        <ImagePlus size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          Maximum of {MAX_PHOTOS} photos reached
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
      } ${isImporting ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      {isImporting ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <p className="text-sm text-blue-600 font-medium">
            Importing photos...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload size={24} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Click to add photos
          </p>
          <p className="text-xs text-gray-500">
            {photoCount} / {MAX_PHOTOS} photos &middot; {remaining} remaining
          </p>
        </div>
      )}
    </div>
  );
}

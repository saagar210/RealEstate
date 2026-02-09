import { useState, useRef, useEffect } from "react";
import { Download, FileText, File, Loader2, ChevronDown } from "lucide-react";
import { useExport } from "../../hooks/useExport";

interface ExportMenuProps {
  propertyId: string;
  listingIds: string[];
  disabled?: boolean;
}

export function ExportMenu({ propertyId, listingIds, disabled = false }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleExportPdf, handleExportDocx, isExporting } = useExport();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onExportPdf = async () => {
    setOpen(false);
    await handleExportPdf(propertyId, listingIds);
  };

  const onExportDocx = async () => {
    setOpen(false);
    await handleExportDocx(propertyId, listingIds);
  };

  const isDisabled = disabled || listingIds.length === 0 || isExporting;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isDisabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={onExportPdf}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
          >
            <FileText className="w-4 h-4 text-red-500" />
            Download PDF
          </button>
          <button
            onClick={onExportDocx}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
          >
            <File className="w-4 h-4 text-blue-500" />
            Download DOCX
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { exportPdf, exportDocx } from "../lib/tauri";
import toast from "react-hot-toast";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = useCallback(
    async (propertyId: string, listingIds: string[]) => {
      setIsExporting(true);
      try {
        const bytes = await exportPdf(propertyId, listingIds);
        const filePath = await save({
          defaultPath: "property-listing.pdf",
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (filePath) {
          await writeFile(filePath, new Uint8Array(bytes));
          toast.success("PDF saved successfully");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`PDF export failed: ${message}`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const handleExportDocx = useCallback(
    async (propertyId: string, listingIds: string[]) => {
      setIsExporting(true);
      try {
        const bytes = await exportDocx(propertyId, listingIds);
        const filePath = await save({
          defaultPath: "property-listing.docx",
          filters: [{ name: "Word Document", extensions: ["docx"] }],
        });
        if (filePath) {
          await writeFile(filePath, new Uint8Array(bytes));
          toast.success("DOCX saved successfully");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`DOCX export failed: ${message}`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { handleExportPdf, handleExportDocx, isExporting };
}

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface EmailPreviewProps {
  text: string;
}

interface ParsedEmail {
  subject: string;
  preview: string;
  body: string;
}

function parseEmail(text: string): ParsedEmail {
  const lines = text.split("\n");
  let subject = "";
  let preview = "";
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("SUBJECT:")) {
      subject = line.replace("SUBJECT:", "").trim();
    } else if (line.startsWith("PREVIEW:")) {
      preview = line.replace("PREVIEW:", "").trim();
    } else if (line === "---") {
      bodyStartIndex = i + 1;
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();

  return { subject, preview, body };
}

type CopiedField = "all" | "subject" | "body" | null;

export function EmailPreview({ text }: EmailPreviewProps) {
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const { subject, preview, body } = parseEmail(text);

  const handleCopy = async (field: CopiedField, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fullEmail = `Subject: ${subject}\n\n${body}`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Email header area */}
      <div className="px-5 pt-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{subject || "Subject line"}</p>
          </div>
          <CopyButton
            label="Subject"
            isCopied={copiedField === "subject"}
            onClick={() => handleCopy("subject", subject)}
          />
        </div>
        {preview && (
          <p className="text-xs text-gray-400 italic">{preview}</p>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Email body */}
      <div className="px-5 py-4">
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {body || "Email body will appear here."}
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-gray-100 bg-gray-50">
        <CopyButton
          label="Body"
          isCopied={copiedField === "body"}
          onClick={() => handleCopy("body", body)}
        />
        <CopyButton
          label="All"
          isCopied={copiedField === "all"}
          onClick={() => handleCopy("all", fullEmail)}
          primary
        />
      </div>
    </div>
  );
}

function CopyButton({
  label,
  isCopied,
  onClick,
  primary = false,
}: {
  label: string;
  isCopied: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  const baseClass = primary
    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors ${baseClass}`}
    >
      {isCopied ? (
        <>
          <Check size={12} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={12} />
          Copy {label}
        </>
      )}
    </button>
  );
}

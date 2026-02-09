import { useState } from "react";
import { Loader2, Key, ExternalLink } from "lucide-react";
import { validateLicenseKey } from "../lib/tauri";

interface LicenseModalProps {
  onActivated: () => void;
}

export function LicenseModal({ onActivated }: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError("Please enter a license key");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const status = await validateLicenseKey(licenseKey.trim());
      if (status.isValid) {
        onActivated();
      } else {
        setError(status.error ?? "Invalid license key. Please check and try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Validation failed: ${message}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Activate License
            </h2>
            <p className="text-sm text-gray-500">
              Enter your license key to use the app
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Key
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleActivate();
              }}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              disabled={isValidating}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono ${
                error ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50`}
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mt-1.5">{error}</p>}
          </div>

          <button
            onClick={handleActivate}
            disabled={isValidating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {isValidating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating...
              </>
            ) : (
              "Activate"
            )}
          </button>

          <div className="text-center pt-2">
            <a
              href="https://realestate-listing-optimizer.lemonsqueezy.com/buy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              Buy a license
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

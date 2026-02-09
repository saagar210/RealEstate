import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

interface BrandVoiceUploaderProps {
  onSubmit: (name: string, description: string | null, samples: string[]) => Promise<void>;
  isCreating: boolean;
}

export function BrandVoiceUploader({ onSubmit, isCreating }: BrandVoiceUploaderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [samples, setSamples] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSample = () => {
    if (samples.length < 5) {
      setSamples([...samples, ""]);
    }
  };

  const removeSample = (index: number) => {
    if (samples.length > 2) {
      setSamples(samples.filter((_, i) => i !== index));
    }
  };

  const updateSample = (index: number, value: string) => {
    const updated = [...samples];
    updated[index] = value;
    setSamples(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    const filledSamples = samples.filter((s) => s.trim().length > 0);
    if (filledSamples.length < 2) {
      newErrors.samples = "At least 2 listing samples are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const filledSamples = samples.filter((s) => s.trim().length > 0);
    await onSubmit(
      name.trim(),
      description.trim() || null,
      filledSamples
    );
    // Reset form on success
    setName("");
    setDescription("");
    setSamples(["", ""]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Create Brand Voice Profile</h3>
      <p className="text-sm text-gray-500">
        Paste 2-5 of your past listing descriptions. We'll analyze your writing style and use it in future generations.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Voice Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Luxury Style"
          disabled={isCreating}
          className={`w-full px-3 py-2 border rounded-md text-sm ${
            errors.name ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this voice style"
          disabled={isCreating}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Sample Listings * (min 2)
          </label>
          {samples.length < 5 && (
            <button
              type="button"
              onClick={addSample}
              disabled={isCreating}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={12} />
              Add another
            </button>
          )}
        </div>
        {errors.samples && <p className="text-xs text-red-500">{errors.samples}</p>}

        {samples.map((sample, i) => (
          <div key={i} className="relative">
            <label className="block text-xs text-gray-500 mb-1">
              Listing {i + 1}
            </label>
            <textarea
              value={sample}
              onChange={(e) => updateSample(i, e.target.value)}
              placeholder="Paste a listing description you've written..."
              disabled={isCreating}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-y"
            />
            {samples.length > 2 && (
              <button
                type="button"
                onClick={() => removeSample(i)}
                disabled={isCreating}
                className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isCreating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
      >
        {isCreating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analyzing Writing Style...
          </>
        ) : (
          "Create Voice Profile"
        )}
      </button>
    </div>
  );
}

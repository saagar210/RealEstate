import { Trash2 } from "lucide-react";
import type { BrandVoice, ExtractedStyle } from "../../lib/types";

interface BrandVoicePreviewProps {
  voice: BrandVoice;
  onDelete: (id: string) => void;
}

function parseStyle(json: string): ExtractedStyle | null {
  try {
    return JSON.parse(json) as ExtractedStyle;
  } catch {
    return null;
  }
}

export function BrandVoicePreview({ voice, onDelete }: BrandVoicePreviewProps) {
  const style = parseStyle(voice.extractedStyle);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{voice.name}</h4>
          {voice.description && (
            <p className="text-sm text-gray-500">{voice.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Based on {voice.sampleCount} sample{voice.sampleCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => onDelete(voice.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Delete voice"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {style && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Tone: </span>
            <span className="text-gray-600">{style.tone}</span>
          </div>

          {style.vocabulary && style.vocabulary.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Vocabulary: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {style.vocabulary.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {style.themes && style.themes.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Themes: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {style.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {style.signaturePhrases && style.signaturePhrases.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Signature phrases: </span>
              <div className="mt-1 space-y-0.5">
                {style.signaturePhrases.map((phrase, i) => (
                  <p key={i} className="text-gray-600 italic text-xs">"{phrase}"</p>
                ))}
              </div>
            </div>
          )}

          {style.sentencePatterns && (
            <div>
              <span className="font-medium text-gray-700">Sentence patterns: </span>
              <span className="text-gray-600">{style.sentencePatterns}</span>
            </div>
          )}
        </div>
      )}

      {!style && (
        <p className="text-sm text-gray-400 italic">Could not parse style data</p>
      )}
    </div>
  );
}

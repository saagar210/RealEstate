import { Home, Search, BarChart, Calendar } from "lucide-react";
import type { EmailTemplate } from "@/lib/types";

interface TemplateSelectorProps {
  value: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
  disabled?: boolean;
}

const templates: { id: EmailTemplate; label: string; description: string; icons: React.ReactNode }[] = [
  {
    id: "buyer",
    label: "Buyer Lead",
    description: "Email matching buyers to this property",
    icons: (
      <div className="flex items-center gap-1">
        <Home size={18} />
        <Search size={14} />
      </div>
    ),
  },
  {
    id: "seller",
    label: "Seller Lead",
    description: "Neighborhood CMA social proof email",
    icons: <BarChart size={18} />,
  },
  {
    id: "open_house",
    label: "Open House",
    description: "Open house invitation with event details",
    icons: <Calendar size={18} />,
  },
];

export function TemplateSelector({ value, onChange, disabled }: TemplateSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Template
      </label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => {
          const isSelected = value === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onChange(template.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors text-center ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={isSelected ? "text-blue-600" : "text-gray-400"}>
                {template.icons}
              </div>
              <span className="text-xs font-medium">{template.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{template.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

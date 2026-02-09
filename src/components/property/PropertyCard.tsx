import { useNavigate } from "react-router-dom";
import { Home, Bed, Bath, Ruler, Trash2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/constants";

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const navigate = useNavigate();
  const typeLabel =
    PROPERTY_TYPES.find((t) => t.value === property.propertyType)?.label ??
    property.propertyType;

  return (
    <div
      onClick={() => navigate(`/property/${property.id}`)}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Placeholder image area */}
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <Home size={36} className="text-gray-300" />
      </div>

      <div className="p-4">
        {/* Price + type */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(property.price)}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {typeLabel}
          </span>
        </div>

        {/* Address */}
        <p className="text-sm font-medium text-gray-800 truncate">
          {property.address}
        </p>
        <p className="text-sm text-gray-500 truncate mb-3">
          {property.city}, {property.state} {property.zip}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Bed size={14} />
            {property.beds} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} />
            {property.baths} ba
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} />
            {formatNumber(property.sqft)} sqft
          </span>
        </div>

        {/* Delete button */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(property.id);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Delete property"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

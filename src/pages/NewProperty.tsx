import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyForm } from "@/components/property/PropertyForm";
import { usePropertyStore } from "@/stores/propertyStore";
import type { CreatePropertyInput } from "@/lib/types";

export function NewProperty() {
  const navigate = useNavigate();
  const createProperty = usePropertyStore((s) => s.createProperty);

  const handleSubmit = async (input: CreatePropertyInput) => {
    try {
      const property = await createProperty(input);
      toast.success("Property created");
      navigate(`/property/${property.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create property";
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Property"
        subtitle="Enter property details to generate marketing content"
        actions={
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PropertyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

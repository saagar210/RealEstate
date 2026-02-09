import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Home, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyCard } from "@/components/property/PropertyCard";
import { usePropertyStore } from "@/stores/propertyStore";

export function Dashboard() {
  const navigate = useNavigate();
  const { properties, isLoading, fetchProperties, deleteProperty } =
    usePropertyStore();

  useEffect(() => {
    fetchProperties().catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to load properties";
      toast.error(message);
    });
  }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      await deleteProperty(id);
      toast.success("Property deleted");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete property";
      toast.error(message);
    }
  };

  const isEmpty = properties.length === 0 && !isLoading;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your property listings"
        actions={
          <button
            onClick={() => navigate("/property/new")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New Property
          </button>
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Home size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-500 mb-4 max-w-sm">
            Create your first property to start generating listing descriptions,
            social media posts, and email campaigns.
          </p>
          <button
            onClick={() => navigate("/property/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Create Your First Listing
          </button>
        </div>
      )}

      {!isEmpty && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

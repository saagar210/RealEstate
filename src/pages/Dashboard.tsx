import { useNavigate } from "react-router-dom";
import { Plus, Home } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export function Dashboard() {
  const navigate = useNavigate();

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
    </div>
  );
}

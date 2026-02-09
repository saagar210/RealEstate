import { useParams, NavLink, Outlet } from "react-router-dom";
import { FileText, Share2, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();

  const tabs = [
    { to: `/property/${id}/listing`, icon: FileText, label: "Generate Listing" },
    { to: `/property/${id}/social`, icon: Share2, label: "Social Media" },
    { to: `/property/${id}/email`, icon: Mail, label: "Email Campaign" },
  ];

  return (
    <div>
      <PageHeader
        title="Property Details"
        subtitle="Property information and content generation"
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-gray-500">Property summary will be shown here (Step 4).</p>
      </div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`
              }
            >
              <tab.icon size={16} />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

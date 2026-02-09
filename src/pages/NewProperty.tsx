import { PageHeader } from "@/components/layout/PageHeader";

export function NewProperty() {
  return (
    <div>
      <PageHeader
        title="New Property"
        subtitle="Enter property details to generate marketing content"
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Property form will be implemented in Step 4.</p>
      </div>
    </div>
  );
}

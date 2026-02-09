import { PageHeader } from "@/components/layout/PageHeader";

export function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="API key and agent profile configuration"
      />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">Settings will be implemented in Step 3.</p>
      </div>
    </div>
  );
}

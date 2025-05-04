import RateSettings from "@/components/settings/RateSettings";
import AdminLayout from "@/components/layout/AdminLayout";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <RateSettings />
      </div>
    </AdminLayout>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loader";
import { axiosClient } from "@/utils/axiosClient";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    unitPrice: 35,
    fcRate: 3.23,
    qtrRate: 0.5,
    fpaRate: 0.1,
    fixedCharges: 1000,
    ptvFee: 35,
    meterRent: 25,
    waterBill: 250,
    gstRate: 0.18,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/api/settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axiosClient.put("/api/settings", settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" show={loading} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bill Component Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (Rs.)
            </label>
            <Input
              type="number"
              value={settings.unitPrice}
              onChange={(e) => handleChange("unitPrice", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Charges Rate (FC)
            </label>
            <Input
              type="number"
              value={settings.fcRate}
              onChange={(e) => handleChange("fcRate", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quarterly Tax Rate (QTR)
            </label>
            <Input
              type="number"
              value={settings.qtrRate}
              onChange={(e) => handleChange("qtrRate", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Price Adjustment Rate (FPA)
            </label>
            <Input
              type="number"
              value={settings.fpaRate}
              onChange={(e) => handleChange("fpaRate", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixed Charges (Rs.)
            </label>
            <Input
              type="number"
              value={settings.fixedCharges}
              onChange={(e) => handleChange("fixedCharges", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PTV Fee (Rs.)
            </label>
            <Input
              type="number"
              value={settings.ptvFee}
              onChange={(e) => handleChange("ptvFee", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meter Rent (Rs.)
            </label>
            <Input
              type="number"
              value={settings.meterRent}
              onChange={(e) => handleChange("meterRent", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Bill (Rs.)
            </label>
            <Input
              type="number"
              value={settings.waterBill}
              onChange={(e) => handleChange("waterBill", e.target.value)}
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Rate (%)
            </label>
            <Input
              type="number"
              value={settings.gstRate * 100}
              onChange={(e) =>
                handleChange(
                  "gstRate",
                  (Number(e.target.value) / 100).toString()
                )
              }
              min="0"
              max="100"
              step="0.01"
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Spinner size="xsmall" show={saving} className="text-white" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

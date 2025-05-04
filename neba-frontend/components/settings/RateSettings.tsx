import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosClient } from "@/utils/axiosClient";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/loader";

export default function RateSettings() {
  const [ratePerUnit, setRatePerUnit] = useState<number>(35);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchRateSettings();
  }, []);

  const fetchRateSettings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/api/rate-settings");
      setRatePerUnit(response.data.ratePerUnit);
    } catch (error) {
      console.error("Error fetching rate settings:", error);
      toast.error("Failed to load rate settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axiosClient.put("/api/rate-settings", { ratePerUnit });
      toast.success("Rate settings updated successfully");
    } catch (error) {
      console.error("Error updating rate settings:", error);
      toast.error("Failed to update rate settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Electricity Rate Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rate">Rate per Unit (Rs.)</Label>
            <Input
              id="rate"
              type="number"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(Number(e.target.value))}
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Spinner size="xsmall" show={saving} className="text-white" />
                Saving...
              </div>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

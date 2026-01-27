"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import DutyTypeService, { DutyType } from "@/services/DutyTypes";
import { toast } from "sonner";
import { useFetchUserZonesQuery } from "@/store/slicers/zoneApi";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

const EditDutyTypePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dutyTypeId = params?.id ? Number(params.id) : null;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<Partial<DutyType>>({
    zone_id: user?.zone_id || 0,
    name: "",
    description: "",
    is_editable: true,
  });

  // Fetch zones using RTK Query hook
  const { data: zoneRes, isLoading: zonesLoading } = useFetchUserZonesQuery();
  const availableZones = zoneRes?.data || [];

  // Load duty type data for editing
  useEffect(() => {
    const loadDutyType = async () => {
      if (!dutyTypeId) {
        toast.error("Invalid duty type ID");
        router.push("/karkun-portal/duty-types");
        return;
      }

      try {
        setLoadingData(true);
        const dutyType = await DutyTypeService.getDutyTypeById(dutyTypeId);
        
        setFormData({
          zone_id: dutyType.zone_id,
          name: dutyType.name,
          description: dutyType.description || "",
          is_editable: dutyType.is_editable,
        });
      } catch (error: any) {
        console.error("Error loading duty type:", error);
        toast.error("Failed to load duty type data");
        router.push("/karkun-portal/duty-types");
      } finally {
        setLoadingData(false);
      }
    };

    if (dutyTypeId) {
      loadDutyType();
    }
  }, [dutyTypeId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dutyTypeId) {
      toast.error("Invalid duty type ID");
      return;
    }

    // Validation matching Laravel rules
    if (!formData.zone_id || !formData.name) {
      toast.error("Zone and Name are required");
      return;
    }

    if (formData.name && formData.name.length > 255) {
      toast.error("Name must not exceed 255 characters");
      return;
    }

    try {
      setLoading(true);
      await DutyTypeService.updateDutyType(dutyTypeId, formData);
      toast.success("Duty type updated successfully");
      router.push("/karkun-portal/duty-types");
    } catch (error: any) {
      console.error("Error updating duty type:", error);
      toast.error(
        error.response?.data?.message || "Failed to update duty type"
      );
    } finally {
      setLoading(false);
    }
  };

  const canFilterZones = user?.is_region_admin || user?.is_all_region_admin;

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/karkun-portal/duty-types"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Duty Types
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Duty Type
          </h2>
          <p className="text-gray-600">
            Update duty type information
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.zone_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zone_id: Number(e.target.value),
                    })
                  }
                  disabled={!canFilterZones}
                  className={`w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white ${
                    !canFilterZones ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  required
                >
                  <option value="">Select Zone</option>
                  {availableZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en} - {zone.city_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                maxLength={255}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Optional description for this duty type"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Duty Type"}
              </button>
              <Link
                href="/karkun-portal/duty-types"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDutyTypePage;


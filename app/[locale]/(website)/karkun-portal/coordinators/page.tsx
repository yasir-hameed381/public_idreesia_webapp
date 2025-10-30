"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import MehfilCoordinatorService, {
  MehfilCoordinator,
} from "@/services/MehfilCoordinators";
import { toast } from "sonner";

interface Zone {
  id: number;
  title_en: string;
  city_en: string;
  country_en: string;
}

interface Mehfil {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  user_type?: string;
}

// Coordinator Types based on Laravel CoordinatorType enum
const COORDINATOR_TYPES = {
  // Mehfil Coordinators
  MEHFIL_CO_1: "Mehfil Coordinator 1",
  MEHFIL_CO_2: "Mehfil Coordinator 2",
  // Tarbiyat Coordinators
  TARBIYAT_MAIN: "Tarbiyat Main Coordinator",
  TARBIYAT_SUB_1: "Tarbiyat Sub Coordinator 1",
  TARBIYAT_SUB_2: "Tarbiyat Sub Coordinator 2",
  TARBIYAT_SUB_3: "Tarbiyat Sub Coordinator 3",
  // Technical Coordinators
  TECHNICAL_MAIN: "Technical Main Coordinator",
  TECHNICAL_SUB_1: "Technical Sub Coordinator 1",
  TECHNICAL_SUB_2: "Technical Sub Coordinator 2",
  // Tajweed Coordinators
  TAJWEED_MAIN: "Tajweed Main Coordinator",
  TAJWEED_SUB_1: "Tajweed Sub Coordinator 1",
  TAJWEED_SUB_2: "Tajweed Sub Coordinator 2",
  // Ahl-e-Bait Coordinators
  AHL_E_BAIT_MAIN: "Ahl-e-Bait Main Coordinator",
  AHL_E_BAIT_SUB_1: "Ahl-e-Bait Sub Coordinator 1",
  AHL_E_BAIT_SUB_2: "Ahl-e-Bait Sub Coordinator 2",
};

const COORDINATOR_CATEGORIES = {
  Mehfil: ["MEHFIL_CO_1", "MEHFIL_CO_2"],
  Tarbiyat: [
    "TARBIYAT_MAIN",
    "TARBIYAT_SUB_1",
    "TARBIYAT_SUB_2",
    "TARBIYAT_SUB_3",
  ],
  Technical: ["TECHNICAL_MAIN", "TECHNICAL_SUB_1", "TECHNICAL_SUB_2"],
  Tajweed: ["TAJWEED_MAIN", "TAJWEED_SUB_1", "TAJWEED_SUB_2"],
  "Ahl-e-Bait": ["AHL_E_BAIT_MAIN", "AHL_E_BAIT_SUB_1", "AHL_E_BAIT_SUB_2"],
};

const CoordinatorListPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);
  const [allKarkuns, setAllKarkuns] = useState<User[]>([]);
  const [coordinators, setCoordinators] = useState<MehfilCoordinator[]>([]);

  // Filters
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(
    user?.zone_id || null
  );
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );

  // Permissions
  const canFilterZones = user?.is_all_region_admin || user?.is_region_admin;

  useEffect(() => {
    if (selectedMehfilId) {
      loadCoordinators();
      loadAvailableKarkuns();
    }
  }, [selectedMehfilId]);

  const loadCoordinators = async () => {
    if (!selectedMehfilId) return;

    try {
      setLoading(true);
      const data = await MehfilCoordinatorService.getActiveCoordinatorsByMehfil(
        selectedMehfilId
      );
      setCoordinators(data);
    } catch (error) {
      console.error("Error loading coordinators:", error);
      toast.error("Failed to load coordinators");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableKarkuns = async () => {
    // In a real implementation, this would load karkuns from an API
    // For now, we'll use a placeholder
    try {
      // TODO: Implement API call to get available karkuns for the mehfil
      setAllKarkuns([]);
    } catch (error) {
      console.error("Error loading karkuns:", error);
    }
  };

  const handleAssignCoordinator = async (
    coordinatorType: string,
    userId: number | null
  ) => {
    if (!selectedMehfilId) {
      toast.error("Please select a mehfil first");
      return;
    }

    try {
      // First, remove existing coordinator of this type
      const existing = coordinators.find(
        (c) => c.coordinator_type === coordinatorType
      );
      if (existing && existing.id) {
        await MehfilCoordinatorService.deleteCoordinator(existing.id);
      }

      // Then assign new coordinator if userId is provided
      if (userId) {
        await MehfilCoordinatorService.createCoordinator({
          mehfil_directory_id: selectedMehfilId,
          user_id: userId,
          coordinator_type: coordinatorType,
        });
      }

      toast.success("Coordinator assigned successfully");
      loadCoordinators();
    } catch (error: any) {
      console.error("Error assigning coordinator:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign coordinator"
      );
    }
  };

  const getCoordinatorForType = (
    type: string
  ): MehfilCoordinator | undefined => {
    return coordinators.find((c) => c.coordinator_type === type);
  };

  const handleDownloadPDF = async () => {
    if (!selectedZoneId || !selectedMehfilId) {
      toast.error("Please select a zone and mehfil to download");
      return;
    }

    try {
      // TODO: Implement PDF download
      toast.success("PDF download feature coming soon");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mehfil Coordinators
              </h2>
              <p className="text-gray-600">
                Manage coordinator assignments for mehfils
              </p>
            </div>
            {selectedMehfilId && (
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
              >
                Download PDF
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setSelectedMehfilId(null);
                }}
                disabled={!canFilterZones}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !canFilterZones ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en} - {zone.city_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Mehfil Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mehfil
              </label>
              <select
                value={selectedMehfilId || ""}
                onChange={(e) =>
                  setSelectedMehfilId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!selectedZoneId}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !selectedZoneId ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select Mehfil</option>
                {mehfils.map((mehfil) => (
                  <option key={mehfil.id} value={mehfil.id}>
                    #{mehfil.mehfil_number} - {mehfil.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Coordinators by Category */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : !selectedMehfilId ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Please select a zone and mehfil to manage coordinators
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(COORDINATOR_CATEGORIES).map(([category, types]) => (
              <div
                key={category}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category} Coordinators
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {types.map((type) => {
                      const coordinator = getCoordinatorForType(type);
                      return (
                        <div key={type} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {
                              COORDINATOR_TYPES[
                                type as keyof typeof COORDINATOR_TYPES
                              ]
                            }
                          </label>
                          <select
                            value={coordinator?.user_id || ""}
                            onChange={(e) =>
                              handleAssignCoordinator(
                                type,
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">-- Select Coordinator --</option>
                            {allKarkuns.map((karkun) => (
                              <option key={karkun.id} value={karkun.id}>
                                {karkun.name}
                              </option>
                            ))}
                          </select>
                          {coordinator && (
                            <div className="text-sm text-gray-600">
                              <p>Current: {coordinator.user_id}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorListPage;

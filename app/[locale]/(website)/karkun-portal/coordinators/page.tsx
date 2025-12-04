"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import mehfilImage from "@/app/assets/mehfile.png";
import { useAuth } from "@/hooks/useAuth";
import MehfilCoordinatorService, {
  MehfilCoordinator,
} from "@/services/MehfilCoordinators";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

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

interface CoordinatorWithUser extends MehfilCoordinator {
  user?: User;
}

interface ZoneAdmin {
  id: number;
  name: string;
  phone_number?: string;
}

// Coordinator Types for all categories
const COORDINATOR_TYPES = {
  // Mehfil Coordinators
  MEHFIL_CO_1: "Mehfil Coordinator 1",
  MEHFIL_CO_2: "Mehfil Coordinator 2",
  // Media Cell Coordinators
  MEDIA_CELL_1: "Media Cell Coordinator 1",
  MEDIA_CELL_2: "Media Cell Coordinator 2",
  MEDIA_CELL_3: "Media Cell Coordinator 3",
  // Finance Coordinators
  FINANCE_1: "Finance Coordinator 1",
  FINANCE_2: "Finance Coordinator 2",
  FINANCE_3: "Finance Coordinator 3",
  // MS Duty Coordinators
  MS_DUTY_1: "MS Duty Coordinator 1",
  MS_DUTY_2: "MS Duty Coordinator 2",
  MS_DUTY_3: "MS Duty Coordinator 3",
};

const COORDINATOR_CATEGORIES = {
  "Mehfil": ["MEHFIL_CO_1", "MEHFIL_CO_2"],
  "Media Cell": ["MEDIA_CELL_1", "MEDIA_CELL_2", "MEDIA_CELL_3"],
  "Finance": ["FINANCE_1", "FINANCE_2", "FINANCE_3"],
  "MS Duty": ["MS_DUTY_1", "MS_DUTY_2", "MS_DUTY_3"],
};

const CoordinatorListPage = () => {
  const { user } = useAuth();
  const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  ).replace(/\/$/, "");

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { Accept: "application/json" },
  });

  apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
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
  const canFilterZones = user?.is_region_admin;

  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await apiClient.get("/dashboard/zones");
        setZones(response.data.data || []);
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };

    if (user) loadZones();
  }, [user]);

  // Load mehfils when zone changes
  useEffect(() => {
    const loadMehfils = async () => {
      if (!selectedZoneId) {
        setMehfils([]);
        return;
      }

      try {
        const response = await apiClient.get("/mehfil-directory", {
          params: { zoneId: selectedZoneId, size: 500 },
        });
        const mehfilData = (response.data.data || []).sort(
          (a: Mehfil, b: Mehfil) => parseInt(a.mehfil_number) - parseInt(b.mehfil_number)
        );
        setMehfils(mehfilData);
      } catch (error) {
        console.error("Error loading mehfils:", error);
      }
    };

    loadMehfils();
  }, [selectedZoneId]);

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
      setLoading(true);

      // Fetch additional data needed for PDF
      const [zoneData, mehfilData, coordinatorsData, zoneAdminData] = await Promise.all([
        apiClient.get(`/zone/${selectedZoneId}`).catch(() => ({ data: { data: null } })),
        apiClient.get(`/mehfil-directory/${selectedMehfilId}`).catch(() => ({ data: { data: null } })),
        apiClient.get("/mehfil-coordinators", {
          params: { mehfil_directory_id: selectedMehfilId },
        }).catch(() => ({ data: { data: [] } })),
        apiClient.get("/karkun", {
          params: {
            zone_id: selectedZoneId,
            is_zone_admin: true,
            size: 1,
          },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      const zone = zoneData.data.data;
      const mehfil = mehfilData.data.data;
      const coordinatorsList: any[] = coordinatorsData.data.data || [];
      const zoneAdmins = zoneAdminData.data.data || [];
      const zoneAdmin: ZoneAdmin | null = zoneAdmins.length > 0
        ? {
            id: zoneAdmins[0].id,
            name: zoneAdmins[0].name,
            phone_number: zoneAdmins[0].phone_number,
          }
        : null;

      // Check if coordinators already have user data, if not fetch it
      const coordinatorsWithUsers: CoordinatorWithUser[] = await Promise.all(
        coordinatorsList.map(async (coordinator) => {
          // If user data is already present, use it
          if (coordinator.user) {
            return coordinator as CoordinatorWithUser;
          }

          // Otherwise, fetch user data
          try {
            const userResponse = await apiClient.get(`/users/${coordinator.user_id}`).catch(() => null);
            if (userResponse?.data?.data) {
              return {
                ...coordinator,
                user: userResponse.data.data,
              } as CoordinatorWithUser;
            }
            
            // Fallback: try karkun endpoint
            const karkunResponse = await apiClient.get(`/karkun/${coordinator.user_id}`).catch(() => null);
            if (karkunResponse?.data?.data) {
              return {
                ...coordinator,
                user: karkunResponse.data.data,
              } as CoordinatorWithUser;
            }

            // If no user data found, return coordinator with minimal info
            return {
              ...coordinator,
              user: {
                id: coordinator.user_id,
                name: `User #${coordinator.user_id}`,
                email: "",
                phone_number: "",
              },
            } as CoordinatorWithUser;
          } catch (error) {
            console.error(`Error fetching user ${coordinator.user_id}:`, error);
            return {
              ...coordinator,
              user: {
                id: coordinator.user_id,
                name: `User #${coordinator.user_id}`,
                email: "",
                phone_number: "",
              },
            } as CoordinatorWithUser;
          }
        })
      );

      // Generate PDF
      generatePDF({
        zone,
        mehfil,
        coordinators: coordinatorsWithUsers,
        zoneAdmin,
      });

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = ({
    zone,
    mehfil,
    coordinators,
    zoneAdmin,
  }: {
    zone: Zone | null;
    mehfil: Mehfil | null;
    coordinators: CoordinatorWithUser[];
    zoneAdmin: ZoneAdmin | null;
  }) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    const title = mehfil
      ? `Coordinators - Mehfil # ${mehfil.mehfil_number} - ${mehfil.name_en || ""}`
      : `Coordinators - ${zone?.title_en || ""}`;

    doc.setFontSize(18);
    doc.text(title, 10, 15);

    // Zone and Mehfil Info
    let yPos = 25;
    doc.setFontSize(12);

    if (zone) {
      doc.text(`Zone: ${zone.title_en}`, 10, yPos);
      yPos += 5;
      if (zone.city_en || zone.country_en) {
        doc.text(
          `Location: ${zone.city_en || ""}${zone.city_en && zone.country_en ? ", " : ""}${zone.country_en || ""}`,
          10,
          yPos
        );
        yPos += 5;
      }
    }

    if (mehfil) {
      doc.text(`Mehfil: #${mehfil.mehfil_number} - ${mehfil.name_en || ""}`, 10, yPos);
      yPos += 5;
      if (mehfil.address_en) {
        const addressLines = doc.splitTextToSize(`Address: ${mehfil.address_en}`, 190);
        doc.text(addressLines, 10, yPos);
        yPos += addressLines.length * 5;
      }
    }

    if (zoneAdmin) {
      doc.text(
        `Zone Admin: ${zoneAdmin.name}${zoneAdmin.phone_number ? ` - ${zoneAdmin.phone_number}` : ""}`,
        10,
        yPos
      );
      yPos += 5;
    }

    yPos += 5;

    // Group coordinators by category
    const coordinatorsByCategory: Record<string, CoordinatorWithUser[]> = {};
    Object.keys(COORDINATOR_CATEGORIES).forEach((category) => {
      coordinatorsByCategory[category] = [];
    });

    coordinators.forEach((coordinator) => {
      Object.entries(COORDINATOR_CATEGORIES).forEach(([category, types]) => {
        if (types.includes(coordinator.coordinator_type)) {
          if (!coordinatorsByCategory[category]) {
            coordinatorsByCategory[category] = [];
          }
          coordinatorsByCategory[category].push(coordinator);
        }
      });
    });

    // Generate tables for each category
    Object.entries(COORDINATOR_CATEGORIES).forEach(([category, types]) => {
      const categoryCoordinators = coordinatorsByCategory[category] || [];
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 15;
      }

      // Category header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${category} Coordinators`, 10, yPos);
      yPos += 8;

      // Prepare table data
      const tableData: any[] = [];
      types.forEach((type) => {
        const coordinator = categoryCoordinators.find((c) => c.coordinator_type === type);
        const coordinatorName = coordinator?.user?.name || "—";
        const coordinatorPhone = coordinator?.user?.phone_number || "—";
        const coordinatorEmail = coordinator?.user?.email || "—";
        const coordinatorTypeLabel = COORDINATOR_TYPES[type as keyof typeof COORDINATOR_TYPES];

        tableData.push([
          coordinatorTypeLabel,
          coordinatorName,
          coordinatorPhone,
          coordinatorEmail,
        ]);
      });

      // Table headers
      const headers = ["Coordinator Type", "Name", "Phone", "Email"];

      // Column widths (adjusted for portrait A4: 210mm width - 20mm margins = 190mm available)
      const columnWidths = [55, 55, 35, 45];

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: yPos,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          halign: "left",
          valign: "middle",
        },
        columnStyles: {
          0: { halign: "left", cellWidth: columnWidths[0] },
          1: { halign: "left", cellWidth: columnWidths[1] },
          2: { halign: "center", cellWidth: columnWidths[2] },
          3: { halign: "left", cellWidth: columnWidths[3] },
        },
        margin: { left: 10, right: 10 },
        tableWidth: "auto",
      });

      // Update yPos after table
      const finalY = (doc as any).lastAutoTable.finalY || yPos;
      yPos = finalY + 10;
    });

    // Generate filename
    let filename = `coordinators-${zone?.title_en || "unknown"}`;
    if (mehfil) {
      filename += `-mehfil-${mehfil.mehfil_number}`;
    }
    filename += `-${new Date().toISOString().split("T")[0]}.pdf`;

    // Save PDF
    doc.save(filename);
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
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {loading ? "Generating PDF..." : "Download PDF"}
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
                value={selectedMehfilId === null ? "" : selectedMehfilId}
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
        {!selectedMehfilId ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Please select a zone and mehfil to manage coordinators
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(COORDINATOR_CATEGORIES).map(([category, types]) => (
              <div
                key={category}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200">
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

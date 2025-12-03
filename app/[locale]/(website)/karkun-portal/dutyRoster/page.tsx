"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Calendar,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Download,
  X,
  Filter,
  Users,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
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

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface Zone {
  id: number;
  title_en: string;
}

interface DutyType {
  id: number;
  name: string;
  zone_id: number;
}

interface DutyAssignment {
  id: number;
  duty_type_id: number;
  duty_type: DutyType;
  mehfil?: MehfilDirectory;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en?: string;
  address_en?: string;
}

interface Karkun {
  id: number;
  name: string;
  father_name?: string;
  phone_number?: string;
  email?: string;
}

interface DutyRoster {
  roster_id?: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    father_name?: string;
    phone_number?: string;
    email?: string;
  };
  mehfil_directory_id?: number;
  mehfil_directory?: MehfilDirectory;
  duties: Record<(typeof DAYS)[number], DutyAssignment[]>;
}

export default function DutyRosterPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State management matching PHP component
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [karkuns, setKarkuns] = useState<Karkun[]>([]);
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [regionId, setRegionId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [mehfilDirectoryId, setMehfilDirectoryId] = useState<number | null>(null);
  const [userTypeFilter, setUserTypeFilter] = useState<"karkun" | "ehad-karkun">("karkun");
  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [removingRosterId, setRemovingRosterId] = useState<number | null>(null);

  // Modals
  const [showAddKarkunModal, setShowAddKarkunModal] = useState(false);
  const [showRemoveKarkunModal, setShowRemoveKarkunModal] = useState(false);
  const [showAddDutyModal, setShowAddDutyModal] = useState(false);
  const [selectedRosterForDuty, setSelectedRosterForDuty] = useState<{
    rosterId: number;
    mehfilDirectoryId: number;
    day: string;
  } | null>(null);

  // Computed properties matching PHP
  const isReadOnly = useMemo(() => {
    return zoneId !== null && mehfilDirectoryId === null;
  }, [zoneId, mehfilDirectoryId]);

  const canManageRoster = useMemo(() => {
    if (isReadOnly) return false;
    if (userTypeFilter === "ehad-karkun") {
      return (
        user?.is_all_region_admin ||
        user?.is_region_admin ||
        user?.is_zone_admin
      );
    }
    return true;
  }, [isReadOnly, userTypeFilter, user]);

  // Initialize filters based on user permissions (matching PHP mount method)
  useEffect(() => {
    if (user) {
      if (user.is_region_admin && user.region_id) {
        setRegionId(user.region_id);
      }
      if ((user.is_mehfil_admin || user.is_zone_admin) && user.zone_id) {
        setZoneId(user.zone_id);
      }
      if (user.is_mehfil_admin && user.mehfil_directory_id) {
        setMehfilDirectoryId(user.mehfil_directory_id);
      }
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadZones();
    }
  }, [user]);

  // Load dependent data when filters change
  useEffect(() => {
    if (zoneId) {
      loadMehfilDirectories();
      loadDutyTypes();
      loadKarkuns();
      loadDutyData();
    } else {
      setShowTable(false);
      setRosters([]);
    }
  }, [zoneId, mehfilDirectoryId, userTypeFilter, search]);

  const loadZones = async () => {
    try {
      const response = await apiClient.get("/dashboard/zones");
      setZones(response.data.data || []);
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  const loadMehfilDirectories = async () => {
    if (!zoneId) {
      setMehfilDirectories([]);
      return;
    }
    try {
      const response = await apiClient.get("/mehfil-directory", {
        params: { zoneId: zoneId },
      });
      const mehfils = (response.data.data || []).sort(
        (a: MehfilDirectory, b: MehfilDirectory) =>
          parseInt(a.mehfil_number) - parseInt(b.mehfil_number)
      );
      setMehfilDirectories(mehfils);
    } catch (error) {
      console.error("Error loading mehfils:", error);
    }
  };

  const loadDutyTypes = async () => {
    if (!zoneId) {
      setDutyTypes([]);
      return;
    }
    try {
      const response = await apiClient.get("/duty-types", {
        params: { zone_id: zoneId },
      });
      const types = (response.data.data || []).sort((a: DutyType, b: DutyType) =>
        a.name.localeCompare(b.name)
      );
      setDutyTypes(types);
    } catch (error) {
      console.error("Error loading duty types:", error);
    }
  };

  const loadKarkuns = async () => {
    if (!zoneId) {
      setKarkuns([]);
      return;
    }
    try {
      const params: any = {
        zone_id: zoneId,
        user_type: userTypeFilter,
        exclude_admins: true,
      };

      if (userTypeFilter === "karkun" && mehfilDirectoryId) {
        params.mehfil_directory_id = mehfilDirectoryId;
      }

      const response = await apiClient.get("/karkun", { params });
      const karkunsList = (response.data.data || []).sort((a: Karkun, b: Karkun) =>
        a.name.localeCompare(b.name)
      );
      setKarkuns(karkunsList);
    } catch (error) {
      console.error("Error loading karkuns:", error);
    }
  };

  const loadDutyData = async () => {
    if (!zoneId) {
      setShowTable(false);
      setRosters([]);
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        zone_id: zoneId,
        user_type: userTypeFilter,
      };

      if (mehfilDirectoryId) {
        params.mehfil_directory_id = mehfilDirectoryId;
      }

      if (search) {
        params.search = search;
      }

      const response = await apiClient.get("/duty-rosters-data", { params });
      setRosters(response.data.data || []);
      setShowTable(true);
    } catch (error) {
      toast.error("Failed to fetch duty rosters");
      console.error("Error fetching rosters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (newZoneId: number | null) => {
    setZoneId(newZoneId);
    setMehfilDirectoryId(null);
  };

  const handleAddKarkunToRoster = async (userId: number) => {
    if (!mehfilDirectoryId) {
      toast.error("Please select a mehfil first.");
      return;
    }

    try {
      // Check if roster already exists
      const existingRoster = rosters.find(
        (r) => r.user_id === userId && r.mehfil_directory_id === mehfilDirectoryId
      );

      if (existingRoster) {
        toast.error("Karkun is already in the roster.");
        setShowAddKarkunModal(false);
        return;
      }

      await apiClient.post("/duty-rosters", {
        user_id: userId,
        zone_id: zoneId,
        mehfil_directory_id: mehfilDirectoryId,
      });

      toast.success("Karkun added to roster successfully.");
      setShowAddKarkunModal(false);
      loadKarkuns();
      loadDutyData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to add karkun to roster"
      );
    }
  };

  const handleAddDuty = async (rosterId: number, day: string, dutyTypeId: number) => {
    if (!selectedRosterForDuty) return;

    try {
      // Check if duty already exists
      const roster = rosters.find((r) => r.roster_id === rosterId);
      const existingAssignment = roster?.duties[day as keyof typeof roster.duties]?.find(
        (a) => a.duty_type_id === dutyTypeId
      );

      if (existingAssignment) {
        toast.error("This duty is already assigned for this day.");
        return;
      }

      const dutyType = dutyTypes.find((dt) => dt.id === dutyTypeId);
      if (dutyType?.name.toLowerCase() === "coordinator") {
        // Check if coordinator already exists for this day
        const coordinatorExists = rosters.some((r) => {
          if (r.mehfil_directory_id !== selectedRosterForDuty.mehfilDirectoryId) {
            return false;
          }
          const dayDuties = r.duties[day as keyof typeof r.duties] || [];
          return dayDuties.some(
            (d) => d.duty_type?.name.toLowerCase() === "coordinator"
          );
        });

        if (coordinatorExists) {
          toast.error(
            "A coordinator is already assigned for this day. Only one coordinator per day is allowed."
          );
          return;
        }
      }

      await apiClient.post("/duty-roster-assignments", {
        duty_roster_id: rosterId,
        duty_type_id: dutyTypeId,
        day: day.toLowerCase(),
      });

      toast.success("Duty added successfully.");
      setShowAddDutyModal(false);
      setSelectedRosterForDuty(null);
      loadDutyData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add duty");
    }
  };

  const handleRemoveDuty = async (assignmentId: number) => {
    try {
      await apiClient.delete(`/duty-roster-assignments/${assignmentId}`);
      toast.success("Duty removed successfully.");
      loadDutyData();
    } catch (error) {
      toast.error("Failed to remove duty");
    }
  };

  const handleRemoveRoster = async () => {
    if (!removingRosterId) return;

    try {
      await apiClient.delete(`/duty-rosters/${removingRosterId}`);
      toast.success("Karkun removed from roster successfully.");
      setShowRemoveKarkunModal(false);
      setRemovingRosterId(null);
      loadDutyData();
    } catch (error) {
      toast.error("Failed to remove roster");
    }
  };

  const handleDownloadRoster = async (includeAll = false) => {
    if (!zoneId) {
      toast.error("Please select a zone to download the roster.");
      return;
    }

    try {
      const params: any = {
        zone_id: zoneId,
        download: true,
      };

      if (mehfilDirectoryId) {
        params.mehfil_directory_id = mehfilDirectoryId;
      }

      if (!includeAll) {
        params.user_type = userTypeFilter;
      }

      const response = await apiClient.get("/duty-rosters/download", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `duty-roster-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Roster downloaded successfully.");
    } catch (error) {
      toast.error("Failed to download roster");
    }
  };

  // Filter available karkuns (not already in roster)
  const availableKarkuns = useMemo(() => {
    if (!mehfilDirectoryId) return [];
    const rosterUserIds = rosters
      .filter((r) => r.mehfil_directory_id === mehfilDirectoryId)
      .map((r) => r.user_id);
    return karkuns.filter((k) => !rosterUserIds.includes(k.id));
  }, [karkuns, rosters, mehfilDirectoryId]);

  // Filter rosters by search
  const filteredRosters = useMemo(() => {
    if (!search) return rosters;
    const searchLower = search.toLowerCase();
    return rosters.filter((roster) => {
      const userName = roster.user?.name?.toLowerCase() || "";
      const fatherName = roster.user?.father_name?.toLowerCase() || "";
      const phone = roster.user?.phone_number?.toLowerCase() || "";
      const email = roster.user?.email?.toLowerCase() || "";
      return (
        userName.includes(searchLower) ||
        fatherName.includes(searchLower) ||
        phone.includes(searchLower) ||
        email.includes(searchLower)
      );
    });
  }, [rosters, search]);

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get karkun ID (zone_id-user_id format)
  const getKarkunId = (roster: DutyRoster): string => {
    if (roster.user?.id && zoneId) {
      return `${zoneId}-${roster.user.id}`;
    }
    return roster.user_id.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Duty Roster
              </h1>
              <p className="text-gray-600 text-sm">
                Manage karkun duty assignments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadRoster(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Download size={18} />
                Download Roster
              </button>
              <button
                onClick={() => router.push("/karkun-portal/coordinators")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Users size={18} />
                Coordinators
              </button>
              {canManageRoster && (
                <button
                  onClick={() => router.push("/karkun-portal/duty-types")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <PlusCircle size={18} />
                  Duty Types
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Zone Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <div className="relative">
                <select
                  value={zoneId || ""}
                  onChange={(e) =>
                    handleZoneChange(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  disabled={user?.is_zone_admin || user?.is_mehfil_admin}
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Mehfil Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mehfil
              </label>
              <div className="relative">
                <select
                  value={mehfilDirectoryId || ""}
                  onChange={(e) =>
                    setMehfilDirectoryId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  disabled={!zoneId || user?.is_mehfil_admin}
                >
                  <option value="">All Mehfils</option>
                  {mehfilDirectories.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en || ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone.."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setUserTypeFilter("karkun")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                userTypeFilter === "karkun"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Karkun
            </button>
            <button
              onClick={() => setUserTypeFilter("ehad-karkun")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                userTypeFilter === "ehad-karkun"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ehad Karkun
            </button>
          </div>

          {/* Warning Message */}
          {isReadOnly && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Viewing duty roster for all mehfils in the zone (read-only).
                Select a mehfil to edit the roster.
              </p>
            </div>
          )}
        </div>

        {/* Table with Weekly View */}
        {showTable && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AVATAR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME / FATHER NAME
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PHONE
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                      >
                        {DAY_LABELS[day].toUpperCase()}
                      </th>
                    ))}
                    {canManageRoster && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td
                        colSpan={mehfilDirectoryId ? 10 : 11}
                        className="text-center py-8"
                      >
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && filteredRosters.length === 0 && (
                    <tr>
                      <td
                        colSpan={mehfilDirectoryId ? 10 : 11}
                        className="text-center py-12"
                      >
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No duty rosters found</p>
                        {canManageRoster && mehfilDirectoryId && (
                          <button
                            onClick={() => setShowAddKarkunModal(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add First Karkun
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filteredRosters.map((roster) => {
                      const userName = roster.user?.name || `User #${roster.user_id}`;
                      const initials = getUserInitials(userName);
                      const karkunId = getKarkunId(roster);
                      
                      return (
                        <tr
                          key={roster.roster_id ?? roster.user_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Avatar */}
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {initials}
                              </span>
                            </div>
                          </td>

                          {/* ID */}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {karkunId}
                          </td>

                          {/* Name / Father Name */}
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {userName}
                            </div>
                            {roster.user?.father_name && (
                              <div className="text-xs text-gray-600 mt-0.5">
                                {roster.user.father_name}
                              </div>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {roster.user?.phone_number || "-"}
                          </td>

                          {/* Days */}
                          {DAYS.map((day) => {
                            const assignments =
                              roster.duties?.[day as keyof typeof roster.duties] ?? [];
                            return (
                              <td
                                key={day}
                                className="px-4 py-3 text-center text-sm relative group"
                              >
                                <div className="space-y-1">
                                  {assignments.length === 0 && (
                                    <span className="text-gray-400">-</span>
                                  )}
                                  {assignments.map((assignment) => {
                                    const dutyName = assignment.duty_type?.name || "Duty";
                                    const mehfilInfo = assignment.mehfil
                                      ? ` ${assignment.mehfil.mehfil_number ? `Mehfil #${assignment.mehfil.mehfil_number}` : ""}`
                                      : "";
                                    return (
                                      <div
                                        key={assignment.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-1"
                                      >
                                        <span>
                                          {dutyName}
                                          {mehfilInfo}
                                        </span>
                                        {canManageRoster && (
                                          <button
                                            onClick={() =>
                                              handleRemoveDuty(assignment.id)
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Remove duty"
                                          >
                                            <X size={12} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {canManageRoster && roster.roster_id && (
                                  <button
                                    onClick={() => {
                                      setSelectedRosterForDuty({
                                        rosterId: roster.roster_id!,
                                        mehfilDirectoryId:
                                          roster.mehfil_directory_id || 0,
                                        day,
                                      });
                                      setShowAddDutyModal(true);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 bg-opacity-50 rounded"
                                    title="Add duty"
                                  >
                                    <PlusCircle size={16} className="text-blue-600" />
                                  </button>
                                )}
                              </td>
                            );
                          })}

                          {/* Actions */}
                          {canManageRoster && (
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setRemovingRosterId(roster.roster_id!);
                                    setShowRemoveKarkunModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove from roster"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Karkun Modal */}
        {showAddKarkunModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Add Karkun to Roster</h2>
              <div className="max-h-96 overflow-y-auto">
                {availableKarkuns.length === 0 ? (
                  <p className="text-gray-600">No available karkuns to add.</p>
                ) : (
                  <div className="space-y-2">
                    {availableKarkuns.map((karkun) => (
                      <button
                        key={karkun.id}
                        onClick={() => handleAddKarkunToRoster(karkun.id)}
                        className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium">{karkun.name}</div>
                        {karkun.father_name && (
                          <div className="text-sm text-gray-500">
                            Son of {karkun.father_name}
                          </div>
                        )}
                        {karkun.phone_number && (
                          <div className="text-sm text-gray-500">
                            {karkun.phone_number}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAddKarkunModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Karkun Modal */}
        {showRemoveKarkunModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Remove Karkun</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove this karkun from the roster? All
                their duty assignments will be removed.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowRemoveKarkunModal(false);
                    setRemovingRosterId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveRoster}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Duty Modal */}
        {showAddDutyModal && selectedRosterForDuty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                Add Duty - {DAY_LABELS[selectedRosterForDuty.day as keyof typeof DAY_LABELS]}
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dutyTypes.length === 0 ? (
                  <p className="text-gray-600">No duty types available.</p>
                ) : (
                  dutyTypes.map((dutyType) => (
                    <button
                      key={dutyType.id}
                      onClick={() =>
                        handleAddDuty(
                          selectedRosterForDuty.rosterId,
                          selectedRosterForDuty.day,
                          dutyType.id
                        )
                      }
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {dutyType.name}
                    </button>
                  ))
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddDutyModal(false);
                    setSelectedRosterForDuty(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

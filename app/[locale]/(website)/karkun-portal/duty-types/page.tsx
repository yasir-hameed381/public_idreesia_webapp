"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DutyTypeService, { DutyType } from "@/services/DutyTypes";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useFetchUserZonesQuery } from "@/store/slicers/zoneApi";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
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

interface Zone {
  id: number | string;
  title_en: string;
  city_en: string;
  country_en?: string;
}

const DutyTypesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(
    user?.zone_id || null
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"created_at" | "name">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch zones using RTK Query hook from zoneApi.ts
  const { data: zoneRes, isLoading: zonesLoading, error: zonesError } = useFetchUserZonesQuery();
  
  // Get zones from RTK Query or fallback to state
  const availableZones = zoneRes?.data || zones;

  const getZoneName = (zoneId: number) => {
    if (!zoneId) return "—";
    
    // Search in RTK Query zones first (id is string)
    if (zoneRes?.data) {
      const rtkZone = zoneRes.data.find((z) => Number(z.id) === Number(zoneId));
      if (rtkZone) {
        return rtkZone.title_en || "—";
      }
    }
    
    // Fallback to state zones (id is number)
    const zone = zones.find((z) => Number(z.id) === Number(zoneId));
    return zone ? zone.title_en : "—";
  };


  // Permissions
  const canFilterZones = user?.is_region_admin || user?.is_all_region_admin;
  const canManage = user?.is_zone_admin || canFilterZones;

  // Initialize zone based on user permissions (matching PHP mount)
  useEffect(() => {
    if (user) {
      if (user.is_region_admin && user.region_id) {
        setRegionId(user.region_id);
      }
      if (user.is_zone_admin && user.zone_id) {
        setSelectedZoneId(user.zone_id);
      }
    }
  }, [user]);

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        if (canFilterZones && regionId) {
          // Note: Backend zone endpoint doesn't support region_id filter
          // Using dashboard/zones which filters by user permissions
          const response = await apiClient.get("/dashboard/zones");
          setZones(response.data.data || []);
        } else if (user?.zone) {
          setZones([user.zone as Zone]);
        }
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };

    if (user) {
      loadZones();
    }
  }, [user, canFilterZones, regionId]);

  useEffect(() => {
    if (selectedZoneId) {
      loadDutyTypes();
    }
  }, [selectedZoneId, search, page, pageSize, sortBy, sortDirection]);

  const loadDutyTypes = async () => {
    if (!selectedZoneId) return;

    try {
      setLoading(true);
      const params: any = {
        page,
        size: pageSize,
        zone_id: selectedZoneId,
      };

      if (search) {
        params.search = search;
      }

      // Note: Backend doesn't support sort_by/sort_direction, so we'll sort client-side
      const response = await apiClient.get("/duty-types-data", { params });
      let dutyTypesList = response.data.data || [];
      
      // Client-side sorting since backend doesn't support it
      if (sortBy === "name") {
        dutyTypesList = [...dutyTypesList].sort((a, b) => {
          const comparison = (a.name || "").localeCompare(b.name || "");
          return sortDirection === "asc" ? comparison : -comparison;
        });
      } else if (sortBy === "created_at") {
        dutyTypesList = [...dutyTypesList].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });
      }
      setDutyTypes(dutyTypesList);

      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error loading duty types:", error);
      toast.error("Failed to load duty types");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await DutyTypeService.deleteDutyType(deleteId);
      toast.success("Duty type deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
      loadDutyTypes();
    } catch (error: any) {
      console.error("Error deleting duty type:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete duty type"
      );
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
                Duty Types
              </h2>
              <p className="text-gray-600">Manage duty types for your zone</p>
            </div>
            {canManage && (
              <Link
                href="/karkun-portal/duty-types/new"
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
              >
                + Add Duty Type
              </Link>
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
                  setPage(1);
                }}
                disabled={!canFilterZones}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !canFilterZones ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select Zone</option>
                {availableZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en} - {zone.city_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search duty types..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Sort By */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "created_at" | "name");
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="created_at">Created At</option>
                <option value="name">Name</option>
              </select>
            </div> */}
          </div>
          {/* Items per page selector */}
          <div className="flex items-center justify-end gap-2">
<div className="bg-white rounded-lg shadow-md p-2 mb-2 border border-gray-200">
                    <label className="text-sm text-gray-600">Show:</label>
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        className="px-3 py-1.5 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                  </div>
        </div>

        {/* Duty Types Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : !selectedZoneId ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Please select a zone to view duty types
            </p>
          </div>
        ) : dutyTypes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No duty types found</p>
            {canManage && (
              <Link
                href="/karkun-portal/duty-types/new"
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add First Duty Type
              </Link>
            )}
          </div>
        ) : (
          <>

            <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    {canManage && (
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dutyTypes.map((dutyType) => {
                    const isEditable = Boolean((dutyType as any).is_editable === 1 || dutyType.is_editable === true);
                    return (
                      <tr key={dutyType.id} className="hover:bg-gray-50">

  {/* Zone Name */}
  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
    {getZoneName(dutyType.zone_id)}
  </td>

  {/* Duty Type Name */}
  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
    {dutyType.name}
  </td>

  {/* Description */}
  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
    {dutyType.description || "—"}
  </td>

  {/* Created By */}
  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
    {dutyType.created_by}
  </td>

  {/* Created At */}
  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
    {dutyType.created_at
      ? new Date(dutyType.created_at).toLocaleString()
      : "—"}
  </td>

  {/* Actions (if allowed) */}
  {canManage && (
    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
      <div className="flex justify-center gap-2">
        <Link
          href={`/karkun-portal/duty-types/edit/${dutyType.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          Edit
        </Link>

        <button
          onClick={() => {
            setDeleteId(dutyType.id!);
            setShowDeleteModal(true);
          }}
          className="text-red-600 hover:text-red-800"
        >
          Delete
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
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this duty type? This action
                cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
};

export default DutyTypesPage;

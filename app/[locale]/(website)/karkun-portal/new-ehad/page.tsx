"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Calendar,
  Pencil,
} from "lucide-react";
import axios from "axios";

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
  id: number;
  title_en: string;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
}

interface NewEhad {
  id: number;
  name: string;
  father_name?: string;
  phone_number?: string;
  zone_id?: number;
  mehfil_directory_id?: number;
  zone?: Zone;
  mehfilDirectory?: MehfilDirectory;
  creator?: { name: string };
  follow_ups_count?: number;
  created_at: string;
}

const NewEhadPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State matching PHP component
  const [newEhads, setNewEhads] = useState<NewEhad[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [perPage, setPerPage] = useState(10);

  // Filters
  const [regionId, setRegionId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [mehfilDirectoryId, setMehfilDirectoryId] = useState<number | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNewEhadId, setDeletingNewEhadId] = useState<number | null>(null);

  // Initialize filters based on user permissions (matching PHP mount)
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

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await apiClient.get("/dashboard/zones");
        setZones(response.data.data || []);
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };

    if (user) {
      loadZones();
    }
  }, [user]);

  // Load mehfils when zone changes
  useEffect(() => {
    const loadMehfils = async () => {
      if (!zoneId) {
        setMehfilDirectories([]);
        return;
      }

      try {
        const response = await apiClient.get("/mehfil-directory", {
          params: { zoneId: zoneId, size: 500 },
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

    loadMehfils();
  }, [zoneId]);

  // Load new ehads
  useEffect(() => {
    loadNewEhads();
  }, [
    regionId,
    zoneId,
    mehfilDirectoryId,
    search,
    dateFrom,
    dateTo,
    currentPage,
    perPage,
  ]);

  const loadNewEhads = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: perPage,
      };

      // Apply filters matching PHP component
      // Note: Backend currently only supports page, size, and search parameters
      // Advanced filtering will need to be done client-side or backend needs to be updated
      if (zoneId) {
        params.zone_id = zoneId;
      }
      if (mehfilDirectoryId) {
        params.mehfil_directory_id = mehfilDirectoryId;
      }

      // Apply search
      if (search) {
        params.search = search;
      }

      // Note: Backend doesn't support date_from and date_to filters yet
      // These would need to be implemented on the backend or filtered client-side

      const response = await apiClient.get("/new-karkun", { params });
      let newEhadsData = response.data.data || [];
      
      // Client-side filtering for unsupported backend filters
      if (regionId) {
        // Filter by region_id if available in the data
        newEhadsData = newEhadsData.filter((item: any) => item.zone_id && item.zone?.region_id === regionId);
      }
      if (dateFrom) {
        newEhadsData = newEhadsData.filter((item: any) => {
          const itemDate = new Date(item.created_at);
          return itemDate >= new Date(dateFrom);
        });
      }
      if (dateTo) {
        newEhadsData = newEhadsData.filter((item: any) => {
          const itemDate = new Date(item.created_at);
          return itemDate <= new Date(dateTo);
        });
      }
      
      setNewEhads(newEhadsData);
      setTotalPages(response.data.meta?.last_page || 1);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      toast.error("Failed to load new ehads");
      console.error("Error loading new ehads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (newZoneId: number | null) => {
    setZoneId(newZoneId);
    setMehfilDirectoryId(null);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deletingNewEhadId) return;

    try {
      await apiClient.delete(`/new-karkun/${deletingNewEhadId}`);
      toast.success("New Ehad deleted successfully");
      setShowDeleteModal(false);
      setDeletingNewEhadId(null);
      loadNewEhads();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete new ehad");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">New Ehads</h2>
              <p className="text-gray-600">View and manage new ehad entries</p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={() => router.push("/karkun-portal/new-ehad/new")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add New Ehad
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  disabled={user?.is_zone_admin || user?.is_mehfil_admin}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Zones</option>
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
                  onChange={(e) => {
                    setMehfilDirectoryId(
                      e.target.value ? Number(e.target.value) : null
                    );
                    setCurrentPage(1);
                  }}
                  disabled={!zoneId || user?.is_mehfil_admin}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Mehfils</option>
                  {mehfilDirectories.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : newEhads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No new ehads found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone / Mehfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Follow Ups
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newEhads.map((newEhad) => (
                      <tr key={newEhad.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {newEhad.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {newEhad.father_name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {newEhad.phone_number || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {newEhad.zone?.title_en || "—"}
                          </div>
                          {newEhad.mehfilDirectory && (
                            <div className="text-xs text-gray-500">
                              #{newEhad.mehfilDirectory.mehfil_number} -{" "}
                              {newEhad.mehfilDirectory.name_en}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {newEhad.follow_ups_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(newEhad.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                router.push(`/karkun-portal/new-ehad/new?id=${newEhad.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingNewEhadId(newEhad.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * perPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * perPage, total)}
                      </span>{" "}
                      of <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this new ehad? This action cannot be
                undone.
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
                    setDeletingNewEhadId(null);
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

export default NewEhadPage;

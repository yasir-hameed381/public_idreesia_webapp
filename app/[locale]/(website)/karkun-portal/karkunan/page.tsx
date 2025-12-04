"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  ChevronDown,
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
  city_en?: string;
  country_en?: string;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
}

interface Karkun {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  mobile_no?: string;
  user_type?: string;
  zone_id?: number;
  zone?: string | Zone;
  mehfil_directory_id?: number;
  is_mehfil_admin?: boolean;
  is_mehfile_admin?: boolean;
  is_zone_admin?: boolean;
  is_region_admin?: boolean;
  mehfilDirectory?: MehfilDirectory;
  creator?: { name: string };
  created_at?: string;
}

type TabType = "karkun" | "ehad_karkun" | "mehfil_admin" | "zone_admin";

const KarkunanPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State matching PHP component
  const [karkuns, setKarkuns] = useState<Karkun[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<"name" | "email" | "created_at">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<TabType>("karkun");
  const [karkunIdToDelete, setKarkunIdToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Load karkuns
  useEffect(() => {
    loadKarkuns();
  }, [
    regionId,
    zoneId,
    mehfilDirectoryId,
    search,
    activeTab,
    sortBy,
    sortDirection,
    currentPage,
    perPage,
  ]);

  const loadKarkuns = async () => {
    setLoading(true);
    try {
      // Backend currently only supports page, size, and search parameters
      // Advanced filtering will need to be done client-side or backend needs to be updated
      const params: any = {
        page: currentPage,
        size: perPage,
      };

      // Apply search
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get("/karkun", { params });
      let karkunsData = response.data.data || [];
      
      // Client-side filtering (since backend doesn't support advanced filters yet)
      // Note: Backend model uses 'zone' as string and 'mehfile' as string, not IDs
      if (zoneId) {
        karkunsData = karkunsData.filter((k: Karkun) => {
          if (typeof k.zone === 'object' && k.zone?.id) {
            return k.zone.id === zoneId;
          }
          // If zone is a string, try to match by zone_id if available
          return k.zone_id === zoneId;
        });
      }
      if (mehfilDirectoryId && !["ehad_karkun", "zone_admin"].includes(activeTab)) {
        karkunsData = karkunsData.filter((k: Karkun) => k.mehfil_directory_id === mehfilDirectoryId);
      }

      // Apply tab filters
      if (activeTab === "mehfil_admin") {
        karkunsData = karkunsData.filter((k: Karkun) => 
          k.is_mehfil_admin === true || k.is_mehfile_admin === true
        );
      } else if (activeTab === "zone_admin") {
        karkunsData = karkunsData.filter((k: Karkun) => k.is_zone_admin === true);
      } else if (activeTab === "karkun") {
        karkunsData = karkunsData.filter((k: Karkun) => 
          (k.user_type === "karkun" || !k.user_type) && 
          !k.is_mehfil_admin && 
          !k.is_mehfile_admin &&
          !k.is_zone_admin && 
          !k.is_region_admin
        );
      } else if (activeTab === "ehad_karkun") {
        karkunsData = karkunsData.filter((k: Karkun) => k.user_type === "ehad_karkun");
      }

      // Client-side sorting
      karkunsData.sort((a: Karkun, b: Karkun) => {
        let aVal: any, bVal: any;
        if (sortBy === "name") {
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
        } else if (sortBy === "email") {
          aVal = a.email?.toLowerCase() || "";
          bVal = b.email?.toLowerCase() || "";
        } else {
          aVal = a.created_at || "";
          bVal = b.created_at || "";
        }
        
        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });

      setKarkuns(karkunsData);
      setTotalPages(Math.ceil(karkunsData.length / perPage));
      setTotal(karkunsData.length);
    } catch (error) {
      toast.error("Failed to load karkuns");
      console.error("Error loading karkuns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (newZoneId: number | null) => {
    setZoneId(newZoneId);
    setMehfilDirectoryId(null);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSort = (field: "name" | "email" | "created_at") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!karkunIdToDelete) return;

    try {
      await apiClient.delete(`/karkun/${karkunIdToDelete}`);
      toast.success("Karkun deleted successfully");
      setShowDeleteModal(false);
      setKarkunIdToDelete(null);
      loadKarkuns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete karkun");
    }
  };

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case "karkun":
        return "Karkun";
      case "ehad_karkun":
        return "Ehad Karkun";
      case "mehfil_admin":
        return "Mehfil Admin";
      case "zone_admin":
        return "Zone Admin";
      default:
        return "All";
    }
  };

  const SortIcon = ({ field }: { field: "name" | "email" | "created_at" }) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Karkuns</h2>
              <p className="text-gray-600">Manage Karkun accounts</p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={() => {
                  sessionStorage.removeItem("editRow");
                  router.push("/karkun-portal/karkunan/new");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add Karkun
              </button>
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
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {(["karkun", "ehad_karkun", "mehfil_admin", "zone_admin"] as TabType[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {getTabLabel(tab)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : karkuns.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No karkuns found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          <SortIcon field="name" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-2">
                          Email
                          <SortIcon field="email" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone / Mehfil
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {karkuns.map((karkun) => (
                      <tr key={karkun.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {karkun.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{karkun.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {karkun.phone_number || karkun.mobile_no || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {typeof karkun.zone === 'object' 
                              ? karkun.zone?.title_en 
                              : karkun.zone || "—"}
                          </div>
                          {karkun.mehfilDirectory && (
                            <div className="text-xs text-gray-500">
                              #{karkun.mehfilDirectory.mehfil_number} -{" "}
                              {karkun.mehfilDirectory.name_en}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                sessionStorage.setItem(
                                  "editRow",
                                  JSON.stringify({ id: karkun.id })
                                );
                                router.push(`/karkun-portal/karkunan/${karkun.id}/edit`);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setKarkunIdToDelete(karkun.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
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
                Are you sure you want to delete this karkun? This action cannot be
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
                    setKarkunIdToDelete(null);
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

export default KarkunanPage;

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
  Lock,
  MoreVertical,
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

// Response interceptor to handle errors and log details
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      // Server responded with error status
      console.error("API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("API Error - No Response:", {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      // Error setting up the request
      console.error("API Error - Request Setup:", error.message);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.error("Unauthorized - Token may be expired or invalid");
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth-token");
        if (!token) {
          console.warn("No token found - user may need to log in again");
        }
      }
    }
    
    return Promise.reject(error);
  }
);

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
  name_ur?: string | null;
  email: string;
  phone_number?: string | null;
  mobile_no?: string;
  id_card_number?: string | null;
  father_name?: string | null;
  father_name_ur?: string | null;
  user_type?: string;
  zone_id?: number | null;
  region_id?: number | null;
  zone?: string | Zone;
  mehfil_directory_id?: number | null;
  address?: string | null;
  birth_year?: number | null;
  ehad_year?: number | null;
  duty_days?: string | string[] | null;
  duty_type?: string | null;
  city?: string | null;
  country?: string | null;
  avatar?: string | null;
  is_mehfil_admin?: boolean;
  is_mehfile_admin?: boolean;
  is_zone_admin?: boolean;
  is_region_admin?: boolean;
  is_super_admin?: boolean;
  is_all_region_admin?: boolean;
  is_active?: boolean;
  mehfilDirectory?: MehfilDirectory;
  creator?: { name: string };
  created_at?: string;
  updated_at?: string | null;
}

// Interface for Ehad Karkuns from ehad_karkuns table
interface EhadKarkun {
  id: number;
  zone_id: number;
  name_en: string;
  name_ur: string;
  so_en?: string | null; // Son of (English) - mapped to father_name
  so_ur?: string | null; // Son of (Urdu) - mapped to father_name_ur
  mobile_no?: string | null;
  cnic?: string | null;
  city_en?: string | null;
  city_ur?: string | null;
  country_en?: string | null;
  country_ur?: string | null;
  birth_year?: string | number | null;
  ehad_year?: string | number | null;
  ehad_ijazat_year?: string | number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: string;
  to: number;
  total: number;
}

interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

interface KarkunApiResponse {
  data: Karkun[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

interface EhadKarkunApiResponse {
  data: EhadKarkun[];
  links: PaginationLinks;
  meta: PaginationMeta;
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
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);

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
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLinks | null>(null);

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

  // Load zones based on user permissions (matching Laravel Zone::forUser)
  // Using /dashboard/zones endpoint which filters by user permissions
  useEffect(() => {
    const loadZones = async () => {
      if (!user) return;

      try {
        // Use /dashboard/zones endpoint which filters zones based on user permissions
        // This matches Laravel Zone::forUser() behavior
        const response = await apiClient.get("/dashboard/zones");
        let filteredZones: Zone[] = response.data.data || [];

        // Ensure the selected zone (if any) is always in the zones array
        // This is important when zoneId is set before zones are loaded
        const currentZoneId = zoneId || user?.zone_id;
        if (currentZoneId) {
          const selectedZoneExists = filteredZones.some((z: Zone) => z.id === currentZoneId);
          if (!selectedZoneExists) {
            // If zone not found in filtered list, try to fetch it separately
            try {
              const zoneResponse = await apiClient.get(`/zone/${currentZoneId}`);
              if (zoneResponse.data.data) {
                filteredZones = [zoneResponse.data.data, ...filteredZones];
              }
            } catch (err) {
              console.error("Error fetching selected zone:", err);
            }
          }
        }

        setZones(filteredZones);
      } catch (error) {
        console.error("Error loading zones:", error);
        // Fallback: set empty array on error
        setZones([]);
      }
    };

    loadZones();
  }, [user]);

  // Load mehfils when zone changes
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

  // Load mehfils when zone changes (including on mount if zone is already set)
  useEffect(() => {
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
      // If activeTab is "ehad_karkun", fetch from ehad_karkuns table
      if (activeTab === "ehad_karkun") {
        const params: any = {
          page: currentPage,
          size: perPage,
        };

        // Apply search
        if (search) {
          params.search = search;
        }

        // Apply zone filtering
        if (zoneId) {
          params.zone_id = zoneId;
        }

        const response = await apiClient.get("/ehadKarkun", { params });
        
        // Handle API response structure: { data: [...], links: {...}, meta: {...} }
        const apiResponse: EhadKarkunApiResponse = response.data;
        
        let ehadKarkunsData: EhadKarkun[] = [];
        if (apiResponse && apiResponse.data) {
          ehadKarkunsData = Array.isArray(apiResponse.data) ? (apiResponse.data as EhadKarkun[]) : [];
        }
        
        // Store pagination metadata from API
        if (apiResponse.meta) {
          setPaginationMeta(apiResponse.meta);
          setTotalPages(apiResponse.meta.last_page);
          setTotal(apiResponse.meta.total);
          setCurrentPage(apiResponse.meta.current_page);
        }
        
        if (apiResponse.links) {
          setPaginationLinks(apiResponse.links);
        }
        
        // Convert EhadKarkun to Karkun format for display
        const convertedData: Karkun[] = ehadKarkunsData.map((ek: EhadKarkun) => ({
          id: ek.id,
          name: ek.name_en || "",
          name_ur: ek.name_ur || undefined,
          email: "", // Ehad Karkuns don't have email
          phone_number: ek.mobile_no || undefined,
          mobile_no: ek.mobile_no || undefined,
          id_card_number: ek.cnic || undefined,
          father_name: ek.so_en || undefined, // Map so_en to father_name
          father_name_ur: ek.so_ur || undefined, // Map so_ur to father_name_ur
          user_type: "ehad_karkun",
          zone_id: ek.zone_id,
          region_id: undefined,
          mehfil_directory_id: undefined, // Ehad Karkuns don't have mehfil
          address: undefined,
          birth_year: ek.birth_year ? parseInt(String(ek.birth_year)) : undefined,
          ehad_year: ek.ehad_year ? parseInt(String(ek.ehad_year)) : undefined,
          duty_days: undefined,
          duty_type: undefined,
          city: ek.city_en || undefined,
          country: ek.country_en || undefined,
          avatar: undefined, // Ehad Karkuns don't have avatar
          is_mehfil_admin: false,
          is_mehfile_admin: false,
          is_zone_admin: false,
          is_region_admin: false,
          is_super_admin: false,
          is_all_region_admin: false,
          is_active: true,
          created_at: ek.created_at || undefined,
          updated_at: ek.updated_at || undefined,
        }));

        setKarkuns(convertedData);
        setLoading(false);
        return;
      }

      // For other tabs, use the regular karkun endpoint
      // Build API parameters (matching Laravel)
      const params: any = {
        page: currentPage,
        size: perPage,
        activeTab: activeTab, // Pass activeTab to backend for server-side filtering
        sortBy: sortBy, // Pass sortBy to backend for server-side sorting
        sortDirection: sortDirection, // Pass sortDirection to backend
      };

      // Apply search
      if (search) {
        params.search = search;
      }

      // Apply zone filtering - this filters at the backend level for all tabs
      // When a zone is selected, only records from that zone are fetched
      if (zoneId) {
        params.zone_id = zoneId;
      }

      const response = await apiClient.get("/karkun", { params });
      
      // Handle API response structure: { data: [...], links: {...}, meta: {...} }
      const apiResponse: KarkunApiResponse = response.data;
      
      let karkunsData: Karkun[] = [];
      if (apiResponse && apiResponse.data) {
        karkunsData = Array.isArray(apiResponse.data) ? apiResponse.data : [];
        
        // Parse duty_days JSON string if it exists
        karkunsData = karkunsData.map((karkun) => {
          if (karkun.duty_days && typeof karkun.duty_days === 'string') {
            try {
              const parsed = JSON.parse(karkun.duty_days);
              return { ...karkun, duty_days: parsed };
            } catch (e) {
              // If parsing fails, keep original value
              return karkun;
            }
          }
          return karkun;
        });
      }
      
      // Store pagination metadata from API
      if (apiResponse.meta) {
        setPaginationMeta(apiResponse.meta);
        setTotalPages(apiResponse.meta.last_page);
        setTotal(apiResponse.meta.total);
        setCurrentPage(apiResponse.meta.current_page);
      }
      
      if (apiResponse.links) {
        setPaginationLinks(apiResponse.links);
      }
      
      // Apply mehfil filtering (client-side, matching Laravel: not applied for ehad_karkun and zone_admin)
      if (mehfilDirectoryId && !["ehad_karkun", "zone_admin"].includes(activeTab)) {
        karkunsData = karkunsData.filter((k: Karkun) => k.mehfil_directory_id === mehfilDirectoryId);
      }

      // Tab-specific filtering and sorting are now done on the backend via activeTab, sortBy, and sortDirection parameters
      // No need for client-side filtering or sorting - the backend handles this matching Laravel's server-side processing

      setKarkuns(karkunsData);
    } catch (error: any) {
      // Enhanced error handling with detailed logging
      console.error("Error loading karkuns:", error);
      
      // Log full error details
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Headers:", error.response.headers);
        
        // Show more specific error message if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error (${error.response.status})`;
        toast.error(`Failed to load karkuns: ${errorMessage}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Failed to connect to server. Please check your connection.");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error(`Failed to load karkuns: ${error.message}`);
      }
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
        return "Karkuns";
      case "ehad_karkun":
        return "Ehad Karkuns"; // Matching Laravel plural form
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

  // Generate Karkun ID (zone_id-user_id format)
  const getKarkunId = (karkun: Karkun): string => {
    if (karkun.zone_id && karkun.id) {
      return `${karkun.zone_id}-${karkun.id}`;
    }
    return `—`;
  };

  // Format date for display
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "—";
    }
  };

  // Get avatar URL
  const getAvatarUrl = (avatar?: string | null): string | null => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    const apiBaseUrl = API_URL.replace("/api", "");
    return `${apiBaseUrl}/storage/${avatar}`;
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openActionsMenu !== null && !target.closest('.actions-menu-container')) {
        setOpenActionsMenu(null);
      }
    };
    
    if (openActionsMenu !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openActionsMenu]);

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

          

          {/* Tabs - Matching Laravel conditional display */}
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            {/* Always show Karkuns and Ehad Karkuns tabs */}
            {(["karkun", "ehad_karkun"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
            {/* Only show Mehfil Admin and Zone Admin tabs for zone/region admins (matching Laravel) */}
            {(user?.is_zone_admin || user?.is_region_admin || user?.is_all_region_admin) && (
              <>
                <button
                  onClick={() => handleTabChange("mehfil_admin")}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "mehfil_admin"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                  }`}
                >
                  {getTabLabel("mehfil_admin")}
                </button>
                <button
                  onClick={() => handleTabChange("zone_admin")}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === "zone_admin"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                  }`}
                >
                  {getTabLabel("zone_admin")}
                </button>
              </>
            )}
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
                      {zone.title_en} - {zone.city_en || ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Mehfil Filter - Hide for Ehad Karkuns and Zone Admin tabs */}
            {!["ehad_karkun", "zone_admin"].includes(activeTab) && (
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
            )}

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
                  placeholder="Search karkuns..."
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
                      {/* Simplified view for Mehfil Admin and Zone Admin tabs (matching screenshot) */}
                      {activeTab === "mehfil_admin" || activeTab === "zone_admin" ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AVATAR
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center gap-2">
                              NAME
                              <SortIcon field="name" />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            EMAIL
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ACTIONS
                          </th>
                        </>
                      ) : activeTab === "ehad_karkun" ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AVATAR
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center gap-2">
                              NAME (ENGLISH)
                              <SortIcon field="name" />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NAME (URDU)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            FATHER NAME (ENGLISH)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            FATHER NAME (URDU)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PHONE
                          </th>
                        </>
                      ) : (
                        <>
                          {/* Full view for Karkuns tab only */}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            KARKUN ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ZONE
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            MEHFIL
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AVATAR
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center gap-2">
                              NAME (ENGLISH)
                              <SortIcon field="name" />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NAME (URDU)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            FATHER NAME (ENGLISH)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            FATHER NAME (URDU)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            EMAIL
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PHONE
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID CARD
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ADDRESS
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            BIRTH YEAR
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            EHAD YEAR
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CREATED AT
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CREATED BY
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ACTIONS
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {karkuns.map((karkun) => {
                      const avatarUrl = getAvatarUrl(karkun.avatar);
                      const zone = zones.find(z => z.id === karkun.zone_id);
                      const mehfil = mehfilDirectories.find(m => m.id === karkun.mehfil_directory_id);
                      
                      return (
                        <tr 
                          key={karkun.id} 
                          className={`hover:bg-gray-50 ${openActionsMenu === karkun.id ? 'bg-blue-50' : ''}`}
                        >
                          {/* Simplified view for Mehfil Admin and Zone Admin tabs (matching screenshot) */}
                          {activeTab === "mehfil_admin" || activeTab === "zone_admin" ? (
                            <>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={karkun.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                {!avatarUrl && (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                    {karkun.name?.charAt(0)?.toUpperCase() || "A"}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {karkun.name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.email || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center text-sm relative">
                                <div className="flex justify-center actions-menu-container">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionsMenu(openActionsMenu === karkun.id ? null : karkun.id);
                                    }}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {openActionsMenu === karkun.id && (
                                    <div 
                                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            router.push(`/karkun-portal/karkunan/${karkun.id}/password`);
                                            setOpenActionsMenu(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <Lock size={16} />
                                          Change Password
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </>
                          ) : activeTab === "ehad_karkun" ? (
                            <>
                              {/* Ehad Karkuns view */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={karkun.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                {!avatarUrl && (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                    {karkun.name?.charAt(0)?.toUpperCase() || "A"}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {karkun.name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" dir="rtl">
                                {karkun.name_ur || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {karkun.father_name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" dir="rtl">
                                {karkun.father_name_ur || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.phone_number || karkun.mobile_no || "—"}
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Full view for Karkuns and Zone Admin tabs */}
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getKarkunId(karkun)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {zone?.title_en || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {mehfil ? `#${mehfil.mehfil_number} - ${mehfil.name_en}` : "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={karkun.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                {!avatarUrl && (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                    {karkun.name?.charAt(0)?.toUpperCase() || "A"}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {karkun.name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" dir="rtl">
                                {karkun.name_ur || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {karkun.father_name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" dir="rtl">
                                {karkun.father_name_ur || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.email || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.phone_number || karkun.mobile_no || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.id_card_number || "—"}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                                {karkun.address || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.birth_year || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {karkun.ehad_year || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(karkun.created_at)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {(karkun.creator as any)?.name || (karkun as any).created_by_name || "—"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center text-sm relative">
                                <div className="flex justify-center actions-menu-container">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionsMenu(openActionsMenu === karkun.id ? null : karkun.id);
                                    }}
                                    className="text-gray-600 hover:text-gray-900 p-1"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {openActionsMenu === karkun.id && (
                                    <div 
                                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            sessionStorage.setItem(
                                              "editRow",
                                              JSON.stringify({ id: karkun.id })
                                            );
                                            router.push(`/karkun-portal/karkunan/${karkun.id}/edit`);
                                            setOpenActionsMenu(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <Edit size={16} />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            router.push(`/karkun-portal/karkunan/${karkun.id}/password`);
                                            setOpenActionsMenu(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <Lock size={16} />
                                          Change Password
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Matching Laravel UI */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                {/* Left side: Showing X to Y of Z results */}
                <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                  Showing{" "}
                  <span className="text-gray-700">
                    {paginationMeta?.from || (currentPage - 1) * perPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-gray-700">
                    {paginationMeta?.to || Math.min(currentPage * perPage, total)}
                  </span>{" "}
                  of{" "}
                  <span className="text-gray-700">{paginationMeta?.total || total}</span> results
                </div>

                {/* Right side: Pagination controls */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-[1px]">
                  {/* Previous button */}
                  <button
                    onClick={() => {
                      const prevPage = Math.max(1, (paginationMeta?.current_page || currentPage) - 1);
                      setCurrentPage(prevPage);
                    }}
                    disabled={!paginationLinks?.prev && (paginationMeta?.current_page || currentPage) === 1}
                    className="flex justify-center items-center w-6 h-6 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const current = paginationMeta?.current_page || currentPage;
                    const last = paginationMeta?.last_page || totalPages;
                    const pages: (number | string)[] = [];
                    
                    // Show up to 7 page numbers
                    if (last <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= last; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show first page
                      pages.push(1);
                      
                      if (current <= 4) {
                        // Near the start: 1, 2, 3, 4, 5, ..., last
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push("...");
                        pages.push(last);
                      } else if (current >= last - 3) {
                        // Near the end: 1, ..., last-4, last-3, last-2, last-1, last
                        pages.push("...");
                        for (let i = last - 4; i <= last; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle: 1, ..., current-1, current, current+1, ..., last
                        pages.push("...");
                        for (let i = current - 1; i <= current + 1; i++) {
                          pages.push(i);
                        }
                        pages.push("...");
                        pages.push(last);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="text-sm h-6 px-2 rounded-md text-gray-400 font-medium"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = page as number;
                      const isActive = pageNum === current;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`text-sm h-6 px-2 rounded-md font-medium ${
                            isActive
                              ? "bg-gray-100 text-gray-800 cursor-default"
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}

                  {/* Next button */}
                  <button
                    onClick={() => {
                      const nextPage = Math.min(
                        paginationMeta?.last_page || totalPages,
                        (paginationMeta?.current_page || currentPage) + 1
                      );
                      setCurrentPage(nextPage);
                    }}
                    disabled={!paginationLinks?.next && (paginationMeta?.current_page || currentPage) >= (paginationMeta?.last_page || totalPages)}
                    className="flex justify-center items-center w-6 h-6 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
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

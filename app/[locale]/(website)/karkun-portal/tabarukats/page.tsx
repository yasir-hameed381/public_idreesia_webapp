// "use client";

// import React from "react";
// import Link from "next/link";
// import { TabarukatTable } from "@/app/[locale]/(admin)/components/Tabarukats/tabarukat-table";
// import { useAuth } from "@/hooks/useAuth";

// const TabarukatsPage = () => {
//   const { user } = useAuth();
//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         <hr className="border-gray-300 mb-6" />

//         {/* Zone Information Card */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div className="mb-4 md:mb-0">
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                 Tabarukats
//               </h2>
//               <p className="text-gray-600">View and create tabarukat entries</p>
//               <div className="mt-2 inline-flex items-center gap-2 text-sm">
//                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                   ✓ Create Allowed
//                 </span>
//                 <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
//                   ✗ Update/Delete Restricted
//                 </span>
//               </div>
//             </div>
//             {/* User Zone Context */}
//             {user?.zone && (
//               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Your Zone
//                 </p>
//                 <p className="font-semibold text-gray-900">
//                   {user.zone.title_en}
//                 </p>
//                 {user.zone.city_en && (
//                   <p className="text-sm text-gray-600">
//                     {user.zone.city_en}
//                     {user.zone.country_en && `, ${user.zone.country_en}`}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Tabarukats Table */}
//         <div className="bg-white rounded-lg shadow-md">
//           <div className="p-6">
//             <TabarukatTable
//               onView={(tabarukat) => console.log("View tabarukat", tabarukat)}
//               onAdd={() => console.log("Add tabarukat")}
//               onEdit={(tabarukat) => console.log("Edit tabarukat", tabarukat)}
//               hideEdit={true}
//               hideDelete={true}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TabarukatsPage;
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
  ArrowUpDown,
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
  region_id?: number;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
}

interface Tabarukat {
  id: number;
  name: string;
  description?: string;
  co_name?: string;
  phone_number?: string;
  images?: string; // JSON string array
  zone_id?: number;
  mehfil_directory_id?: number;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
}

const TabarukatsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // State matching PHP component
  const [tabarukats, setTabarukats] = useState<Tabarukat[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<"created_at" | "name">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  // Load tabarukats
  useEffect(() => {
    loadTabarukats();
  }, [
    regionId,
    zoneId,
    mehfilDirectoryId,
    search,
    sortBy,
    sortDirection,
    currentPage,
    perPage,
  ]);

  const loadTabarukats = async () => {
    setLoading(true);
    try {
      // Backend currently only supports page, size, and search parameters
      const params: any = {
        page: currentPage,
        size: perPage,
      };

      // Apply search
      if (search) {
        params.search = search;
      }

      const response = await apiClient.get("/tabarukat", { params });
      let tabarukatsData: Tabarukat[] = response.data.data || [];
      
      // Client-side filtering (since backend doesn't support advanced filters yet)
      // Note: Response doesn't include zone/mehfil objects, only IDs
      if (regionId) {
        // Filter by region_id by matching zone_id with zones array
        tabarukatsData = tabarukatsData.filter((t: Tabarukat) => {
          if (!t.zone_id) return false;
          const zone = zones.find(z => z.id === t.zone_id);
          return zone?.region_id === regionId;
        });
      }
      if (zoneId) {
        tabarukatsData = tabarukatsData.filter((t: Tabarukat) => 
          t.zone_id === zoneId
        );
      }
      if (mehfilDirectoryId) {
        tabarukatsData = tabarukatsData.filter((t: Tabarukat) => 
          t.mehfil_directory_id === mehfilDirectoryId
        );
      }

      // Client-side sorting
      tabarukatsData.sort((a: Tabarukat, b: Tabarukat) => {
        let aVal: any, bVal: any;
        if (sortBy === "created_at") {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else if (sortBy === "name") {
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
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

      setTabarukats(tabarukatsData);
      
      // Handle pagination: if filters are applied, use filtered data count
      // Otherwise, use backend pagination meta
      const hasFilters = regionId || zoneId || mehfilDirectoryId;
      if (hasFilters) {
        // When filtering client-side, recalculate pagination from filtered data
        setTotalPages(Math.ceil(tabarukatsData.length / perPage));
        setTotal(tabarukatsData.length);
      } else {
        // Use backend pagination when no client-side filters
        if (response.data.meta) {
          setTotalPages(response.data.meta.last_page || 1);
          setTotal(response.data.meta.total || 0);
        } else {
          setTotalPages(Math.ceil(tabarukatsData.length / perPage));
          setTotal(tabarukatsData.length);
        }
      }
    } catch (error) {
      toast.error("Failed to load tabarukats");
      console.error("Error loading tabarukats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (newZoneId: number | null) => {
    setZoneId(newZoneId);
    setMehfilDirectoryId(null);
    setCurrentPage(1);
  };

  const handleSort = (field: "created_at" | "name") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: "created_at" | "name" }) => {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tabarukats</h2>
              <p className="text-gray-600">View and create tabarukat entries</p>
              <div className="mt-2 inline-flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  ✓ Create Allowed
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                  ✗ Update/Delete Restricted
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={() => router.push("/karkun-portal/tabarukats/new")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add Tabarukat
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Search by name, description, co-name, phone..."
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
          ) : tabarukats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No tabarukats found</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone / Mehfil
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center gap-2">
                          Created At
                          <SortIcon field="created_at" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tabarukats.map((tabarukat) => (
                      <tr key={tabarukat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {tabarukat.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md truncate">
                            {tabarukat.description || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tabarukat.co_name || "—"}
                          </div>
                          {tabarukat.phone_number && (
                            <div className="text-xs text-gray-500">
                              {tabarukat.phone_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {tabarukat.zone_id 
                              ? zones.find(z => z.id === tabarukat.zone_id)?.title_en || `Zone ${tabarukat.zone_id}`
                              : "—"}
                          </div>
                          {tabarukat.mehfil_directory_id && (
                            <div className="text-xs text-gray-500">
                              {(() => {
                                const mehfil = mehfilDirectories.find(m => m.id === tabarukat.mehfil_directory_id);
                                return mehfil 
                                  ? `#${mehfil.mehfil_number} - ${mehfil.name_en}`
                                  : `Mehfil ${tabarukat.mehfil_directory_id}`;
                              })()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(tabarukat.created_at).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default TabarukatsPage;

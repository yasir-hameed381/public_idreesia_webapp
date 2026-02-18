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
  Download,
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
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
}

interface MehfilReport {
  id: number;
  coordinator_name?: string;
  report_month?: number;
  report_year?: number;
  zone_id?: number;
  mehfil_directory_id?: number;
  zone?: Zone;
  mehfilDirectory?: MehfilDirectory;
  ehadKarkun?: { name: string };
  creator?: { name: string };
  created_at: string;
}

const months: Record<number, string> = {
  1: "جنوری",
  2: "فروری",
  3: "مارچ",
  4: "اپریل",
  5: "مئی",
  6: "جون",
  7: "جولائی",
  8: "اگست",
  9: "ستمبر",
  10: "اکتوبر",
  11: "نومبر",
  12: "دسمبر",
};

const MehfilReportsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<MehfilReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "coordinator_name">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [perPage, setPerPage] = useState(10);

  // Filters
  const [regionId, setRegionId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [mehfilDirectoryId, setMehfilDirectoryId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportIdBeingDeleted, setReportIdBeingDeleted] = useState<number | null>(null);

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

    // Initialize available years (current year + 1 to current year - 2)
    const currentYear = new Date().getFullYear();
    setAvailableYears([currentYear + 1, currentYear, currentYear - 1, currentYear - 2]);
  }, [user]);

  // Load zones (dashboard API – karkun portal)
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await apiClient.get("/dashboard/zones");
        const list = response.data?.data ?? response.data ?? [];
        setZones(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error loading zones:", error);
        setZones([]);
      }
    };

    if (user) loadZones();
  }, [user]);

  // Load mehfils when zone changes (dashboard API)
  useEffect(() => {
    if (!zoneId) {
      setMehfilDirectories([]);
      return;
    }

    const loadMehfils = async () => {
      try {
        const response = await apiClient.get(`/dashboard/mehfils/${zoneId}`);
        const list = response.data?.data ?? response.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        arr.sort(
          (a: MehfilDirectory, b: MehfilDirectory) =>
            parseInt(String(a.mehfil_number), 10) - parseInt(String(b.mehfil_number), 10)
        );
        setMehfilDirectories(arr);
      } catch (error) {
        console.error("Error loading mehfils:", error);
        setMehfilDirectories([]);
      }
    };

    loadMehfils();
  }, [zoneId]);

  // Debounce search and reset page
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load reports (only when user available)
  useEffect(() => {
    if (!user) return;
    loadReports();
  }, [
    user,
    regionId,
    zoneId,
    mehfilDirectoryId,
    filterYear,
    filterMonth,
    search,
    sortBy,
    sortDirection,
    currentPage,
    perPage,
  ]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        size: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };
      if (regionId != null) params.region_id = regionId;
      if (zoneId != null) params.zone_id = zoneId;
      if (mehfilDirectoryId != null) params.mehfil_directory_id = mehfilDirectoryId;
      if (filterYear != null) params.report_year = filterYear;
      if (filterMonth != null) params.report_month = filterMonth;
      if (search) params.search = search;

      const response = await apiClient.get("/mehfil-reports", { params });
      const data = response.data?.data ?? response.data ?? [];
      const meta = response.data?.meta ?? {};
      setReports(Array.isArray(data) ? data : []);
      setTotalPages(meta.last_page ?? 1);
      setTotal(meta.total ?? 0);
    } catch (error) {
      toast.error("Failed to load mehfil reports");
      console.error("Error loading reports:", error);
      setReports([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (newZoneId: number | null) => {
    setZoneId(newZoneId);
    setMehfilDirectoryId(null);
    setCurrentPage(1);
  };

  const handleSort = (field: "created_at" | "coordinator_name") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!reportIdBeingDeleted) return;

    try {
      await apiClient.delete(`/mehfil-reports/${reportIdBeingDeleted}`);
      toast.success("Mehfil report deleted successfully");
      setShowDeleteModal(false);
      setReportIdBeingDeleted(null);
      loadReports();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete report");
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (zoneId) params.zone_id = zoneId;
      if (mehfilDirectoryId) params.mehfil_directory_id = mehfilDirectoryId;
      if (filterYear) params.report_year = filterYear;
      if (filterMonth) params.report_month = filterMonth;

      const response = await apiClient.get("/mehfil-reports/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `mehfil-reports-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Reports exported successfully");
    } catch (error) {
      toast.error("Failed to export reports");
      console.error("Error exporting reports:", error);
    }
  };

  const SortIcon = ({ field }: { field: "created_at" | "coordinator_name" }) => {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mehfil Reports</h2>
              <p className="text-gray-600">View and manage mehfil reports</p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => router.push("/karkun-portal/mehfil-reports/submit")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add Report
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

            {/* Year Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <div className="relative">
                <select
                  value={filterYear || ""}
                  onChange={(e) => {
                    setFilterYear(e.target.value ? Number(e.target.value) : null);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <div className="relative">
                <select
                  value={filterMonth || ""}
                  onChange={(e) => {
                    setFilterMonth(e.target.value ? Number(e.target.value) : null);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Months</option>
                  {Object.entries(months).map(([num, name]) => (
                    <option key={num} value={num}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by coordinator, month, year..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {(zoneId != null || mehfilDirectoryId != null || filterYear != null || filterMonth != null || searchInput.trim()) && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const canChangeZone = !user?.is_zone_admin && !user?.is_mehfil_admin;
                  const canChangeMehfil = !user?.is_mehfil_admin;
                  if (canChangeZone) {
                    setZoneId(null);
                    setMehfilDirectoryId(null);
                  } else if (canChangeMehfil) setMehfilDirectoryId(null);
                  setFilterYear(null);
                  setFilterMonth(null);
                  setSearchInput("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No mehfil reports found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("coordinator_name")}
                      >
                        <div className="flex items-center gap-2">
                          Coordinator
                          <SortIcon field="coordinator_name" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month / Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone / Mehfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ehad Karkun
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.coordinator_name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.report_month && report.report_year ? (
                            <div className="text-sm text-gray-900">
                              {months[report.report_month]} {report.report_year}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">—</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {report.zone?.title_en || "—"}
                          </div>
                          {report.mehfilDirectory && (
                            <div className="text-xs text-gray-500">
                              #{report.mehfilDirectory.mehfil_number} -{" "}
                              {report.mehfilDirectory.name_en}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {report.ehadKarkun?.name || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setReportIdBeingDeleted(report.id);
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
                      {total === 0 ? (
                        "0 results"
                      ) : (
                        <>
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * perPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * perPage, total)}
                          </span>{" "}
                          of <span className="font-medium">{total}</span> results
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pageNumbers: React.ReactNode[] = [];
                        const showEllipsisStart = currentPage > 3;
                        const showEllipsisEnd = currentPage < totalPages - 2;
                        
                        // Always show first page
                        pageNumbers.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              currentPage === 1
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            1
                          </button>
                        );
                        
                        // Show ellipsis if needed
                        if (showEllipsisStart) {
                          pageNumbers.push(
                            <span key="ellipsis-start" className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        // Show pages around current page
                        const startPage = Math.max(2, currentPage - 1);
                        const endPage = Math.min(totalPages - 1, currentPage + 1);
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                currentPage === i
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Show ellipsis if needed
                        if (showEllipsisEnd) {
                          pageNumbers.push(
                            <span key="ellipsis-end" className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        // Always show last page if more than 1 page
                        if (totalPages > 1) {
                          pageNumbers.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                currentPage === totalPages
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pageNumbers;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
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
                Are you sure you want to delete this mehfil report? This action cannot
                be undone.
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
                    setReportIdBeingDeleted(null);
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

export default MehfilReportsPage;

"use client";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  ChevronDown,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import KhatService from "@/services/KhatService";
import { MehfilSummary } from "@/types/khat";

interface TabarukatData {
  id: number;
  name: string;
  description: string;
  co_name: string;
  phone_no: string;
  images: string[];
  mehfil_directory_id: number;
  zone_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: TabarukatData[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface TabarukatTableProps {
  onEdit: (data: TabarukatData) => void;
  onAdd: () => void;
  onView: (data: TabarukatData) => void;
  hideCreate?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
}

export function TabarukatTable({
  onEdit,
  onAdd,
  onView,
  hideCreate = false,
  hideEdit = false,
  hideDelete = false,
}: TabarukatTableProps) {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedMehfil, setSelectedMehfil] = useState<number | null>(null);
  const [mehfils, setMehfils] = useState<MehfilSummary[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTabarukat, setSelectedTabarukat] =
    useState<TabarukatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();

  // Fetch zones for filters
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });

  // Fetch mehfils when zone is selected
  useEffect(() => {
    const fetchMehfils = async () => {
      if (!selectedZone) {
        setMehfils([]);
        return;
      }

      try {
        const list = await KhatService.getMehfilsByZone(selectedZone, 500);
        setMehfils(list);
      } catch (error) {
        console.error("Failed to load mehfils", error);
        showError("Unable to load mehfils");
        setMehfils([]);
      }
    };

    fetchMehfils();
  }, [selectedZone, showError]);

  // Fetch tabarukats data
  useEffect(() => {
    const fetchTabarukats = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: perPage.toString(),
          search: debouncedSearch.trim(),
          ...(selectedZone && { zone_id: selectedZone.toString() }),
          ...(selectedMehfil && { mehfil_directory_id: selectedMehfil.toString() }),
        });

        const response = await fetch(
          `http://localhost:3000/api/tabarukat/?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tabarukats");
        }

        const data = await response.json();

        console.log("Fetched tabarukats data:", data);
        setApiResponse(data);
      } catch (err) {
        setError("Failed to load tabarukats data");
        console.error("Error fetching tabarukats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTabarukats();
  }, [debouncedSearch, currentPage, perPage, selectedZone, selectedMehfil]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    if (!selectedTabarukat) return;

    try {
      const response = await fetch(`/api/tabarukat/${selectedTabarukat.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tabarukat");
      }

      showSuccess("Tabarukat deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedTabarukat(null);

      // Refresh data
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        search: debouncedSearch.trim(),
        ...(selectedZone && { zone_id: selectedZone.toString() }),
        ...(selectedMehfil && { mehfil_directory_id: selectedMehfil.toString() }),
      });

      const refreshResponse = await fetch(`/api/tabarukat?${params}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setApiResponse(data);
      }
    } catch {
      showError("Failed to delete tabarukat.");
    }
  };

  const confirmDelete = (tabarukat: TabarukatData) => {
    setSelectedTabarukat(tabarukat);
    setShowDeleteDialog(true);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = apiResponse?.meta?.last_page || 1;
  const currentTotal = apiResponse?.meta?.total || 0;
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, currentTotal);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading tabarukats data
            </div>
            <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tabarukats</h1>
            <p className="text-gray-600 mt-1">
              {hideEdit && hideDelete
                ? "View and create tabarukat entries"
                : "Manage tabarukats and their details"}
            </p>
          </div>
          {!hideCreate && (
            <div>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Plus size={16} />
                Create Tabarukat
              </button>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full lg:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tabarukats..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <select
                  value={selectedZone || ""}
                  onChange={(e) => {
                    const zoneId = e.target.value ? Number(e.target.value) : null;
                    setSelectedZone(zoneId);
                    setSelectedMehfil(null); // Reset mehfil when zone changes
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] max-w-[200px]"
                >
                  <option value="">All Zones</option>
                  {zonesData?.data?.map((zone: any) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMehfil || ""}
                  onChange={(e) => {
                    const mehfilId = e.target.value ? Number(e.target.value) : null;
                    setSelectedMehfil(mehfilId);
                    setCurrentPage(1); // Reset to first page
                  }}
                  disabled={!selectedZone}
                  className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] max-w-[200px] ${
                    !selectedZone ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">All Mehfils</option>
                  {mehfils.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en}
                    </option>
                  ))}
                </select>

                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[80px] max-w-[120px]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mehfil Directory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CO Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiResponse?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No tabarukats found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first tabarukat.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      apiResponse?.data?.map((tabarukat: TabarukatData) => (
                        <tr key={tabarukat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tabarukat.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tabarukat.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {tabarukat.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Mehfil #{tabarukat.mehfil_directory_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tabarukat.co_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tabarukat.phone_no}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(
                                tabarukat.created_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative dropdown-container">
                              <button
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                title="More options"
                                onClick={() => {
                                  setOpenDropdown(
                                    openDropdown === tabarukat.id.toString()
                                      ? null
                                      : tabarukat.id.toString()
                                  );
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {openDropdown === tabarukat.id.toString() && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        onView(tabarukat);
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Eye size={16} />
                                      View
                                    </button>
                                    {!hideEdit && (
                                      <button
                                        onClick={() => {
                                          onEdit(tabarukat);
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                      >
                                        <Edit size={16} />
                                        Edit
                                      </button>
                                    )}
                                    {!hideDelete && (
                                      <button
                                        onClick={() => {
                                          confirmDelete(tabarukat);
                                          setOpenDropdown(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 size={16} />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {apiResponse?.data && apiResponse.data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of {currentTotal}{" "}
                      results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTablePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleTablePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  currentPage === pageNum
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handleTablePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Tabarukat
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedTabarukat?.name}</strong>? This will permanently
              remove the tabarukat from the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedTabarukat(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

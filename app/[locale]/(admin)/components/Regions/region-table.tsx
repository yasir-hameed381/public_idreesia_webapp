"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { RegionService, Region } from "@/services/Region/region-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { useDebounce } from "@/hooks/useDebounce";

interface RegionTableProps {
  onEdit?: (data: any) => void;
  onAdd?: () => void;
  onDelete?: (data: any) => void;
  showActions?: boolean;
}

export function RegionTable({
  onEdit,
  onAdd,
  onDelete,
  showActions = true,
}: RegionTableProps) {
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [data, setData] = useState<Region[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { showError, showSuccess } = useToast();
  const { hasPermission } = usePermissions();

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // Permission checks
  const canEditRegions = hasPermission(PERMISSIONS.EDIT_REGIONS);
  const canDeleteRegions = hasPermission(PERMISSIONS.DELETE_REGIONS);
  const canCreateRegions = hasPermission(PERMISSIONS.CREATE_REGIONS);

  // Fetch regions data
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await RegionService.getAll({
          page: currentPage,
          size: perPage,
          search: debouncedSearch.trim(),
        });
        setData(response.data);
        setMeta(response.meta);
      } catch (err: any) {
        setError(err.message || "Failed to fetch regions");
        showError("Failed to load regions");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [currentPage, perPage, debouncedSearch]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!selectedRegion) return;

    if (!canDeleteRegions) {
      showError("You don't have permission to delete regions");
      return;
    }

    try {
      await RegionService.delete(selectedRegion.id);
      showSuccess("Region deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedRegion(null);
      // Refresh the data after deletion
      const response = await RegionService.getAll({
        page: currentPage,
        size: perPage,
        search: debouncedSearch.trim(),
      });
      setData(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      showError(err.message || "Failed to delete region.");
    }
  };

  const confirmDelete = (region: Region) => {
    if (!canDeleteRegions) {
      showError("You don't have permission to delete regions");
      return;
    }
    setSelectedRegion(region);
    setShowDeleteDialog(true);
  };

  const handleEdit = (region: Region) => {
    if (!canEditRegions) {
      showError("You don't have permission to edit regions");
      return;
    }
    if (onEdit) {
      onEdit(region);
    }
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const totalPages = Math.ceil((meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, meta?.total || 0);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading Regions data
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
              <p className="text-gray-600 mt-1">
                Manage regions and their details
              </p>
            </div>
            {canCreateRegions && onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {/* <Plus size={16} /> */}
                Create Region
              </button>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, CO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found {meta?.total || 0} results
                </div>
              )}
            </div>

            {/* Records Per Page Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading regions...</span>
              </div>
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
                        CO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Primary Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Secondary Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      {showActions && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.length === 0 ? (
                      <tr>
                        <td colSpan={showActions ? 7 : 6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No regions found
                            </h3>
                            <p className="text-gray-600">
                              {search.trim()
                                ? "Try adjusting your search criteria"
                                : "Get started by creating a new region"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.map((region: Region) => (
                        <tr key={region.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {region.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {region.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {region.co || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {region.primary_phone_number || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {region.secondary_phone_number || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {region.created_at
                                ? new Date(region.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "-"}
                            </div>
                          </td>
                          {showActions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                {canEditRegions && (
                                  <button
                                    onClick={() => handleEdit(region)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                )}
                                {canDeleteRegions && (
                                  <button
                                    onClick={() => confirmDelete(region)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta?.total > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startRecord}</span> to{" "}
                      <span className="font-medium">{endRecord}</span> of{" "}
                      <span className="font-medium">{meta?.total || 0}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTablePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handleTablePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Region
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the region "{selectedRegion?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedRegion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


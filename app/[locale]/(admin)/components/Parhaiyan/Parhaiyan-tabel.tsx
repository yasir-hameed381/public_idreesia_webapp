"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import {
  useDeleteParhaiyanMutation,
  useGetParhaiyanQuery,
} from "@/store/slicers/parhaiyanApi";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Eye,
} from "lucide-react";
interface ParhaiyanTableProps {
  onEdit: (parhaiyan: Parhaiyan) => void;
  onAdd: () => void;
  onView?: (parhaiyan: Parhaiyan) => void;
}

export function ParhaiyanTable({ onEdit, onAdd, onView }: ParhaiyanTableProps) {
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedParhaiyan, setSelectedParhaiyan] = useState<Parhaiyan | null>(
    null
  );
  const [allData, setAllData] = useState<Parhaiyan[]>([]);
  const [data, setData] = useState<Parhaiyan[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin, user } = usePermissions();

  // Permission checks
  const canViewParhaiyan =
    isSuperAdmin || hasPermission(PERMISSIONS.VIEW_PARHAIYAN);
  const canCreateParhaiyan =
    isSuperAdmin || hasPermission(PERMISSIONS.CREATE_PARHAIYAN);
  const canEditParhaiyan =
    isSuperAdmin || hasPermission(PERMISSIONS.EDIT_PARHAIYAN);
  const canDeleteParhaiyan =
    isSuperAdmin || hasPermission(PERMISSIONS.DELETE_PARHAIYAN);

  // Debug logging for parhaiyan permissions
  console.log("🔍 Parhaiyan Table Permission Debug:", {
    isSuperAdmin,
    hasViewParhaiyan: hasPermission(PERMISSIONS.VIEW_PARHAIYAN),
    hasCreateParhaiyan: hasPermission(PERMISSIONS.CREATE_PARHAIYAN),
    hasEditParhaiyan: hasPermission(PERMISSIONS.EDIT_PARHAIYAN),
    hasDeleteParhaiyan: hasPermission(PERMISSIONS.DELETE_PARHAIYAN),
    userRole: user?.role?.name,
    userPermissions: user?.role?.permissions?.map((p) => p.name) || [],
    parhaiyanPermissions: [
      PERMISSIONS.VIEW_PARHAIYAN,
      PERMISSIONS.CREATE_PARHAIYAN,
      PERMISSIONS.EDIT_PARHAIYAN,
      PERMISSIONS.DELETE_PARHAIYAN,
    ],
  });

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // Fetch Parhaiyan data
  const {
    data: parhaiyanData,
    error: apiError,
    isLoading: isApiLoading,
    isFetching,
  } = useGetParhaiyanQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
  });

  // Mutation to delete Parhaiyan
  const [deleteParhaiyan, { isLoading: isDeleting }] =
    useDeleteParhaiyanMutation();

  // Update data when API response changes
  useEffect(() => {
    if (parhaiyanData) {
      setAllData(parhaiyanData.data || []);
      setMeta(parhaiyanData.meta || {});
      setData(parhaiyanData.data || []);
      setLoading(false);
    }
  }, [parhaiyanData]);

  // Show error notification
  useEffect(() => {
    if (apiError) {
      setError("Failed to load parhaiyan data");
      setLoading(false);
    }
  }, [apiError]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Filter data when search changes
  useEffect(() => {
    if (allData.length > 0) {
      const filteredData = getFilteredData(allData, debouncedSearch);
      setData(filteredData);
    }
  }, [debouncedSearch, allData]);

  const handleDelete = async () => {
    if (!selectedParhaiyan) return;

    if (!canDeleteParhaiyan) {
      showError("You don't have permission to delete parhaiyan");
      return;
    }

    try {
      const parhaiyanId =
        typeof selectedParhaiyan.id === "string"
          ? parseInt(selectedParhaiyan.id, 10)
          : selectedParhaiyan.id;

      if (typeof parhaiyanId === "number" && !isNaN(parhaiyanId)) {
        await deleteParhaiyan(parhaiyanId).unwrap();
        showSuccess("Parhaiyan deleted successfully.");
        setShowDeleteDialog(false);
        setSelectedParhaiyan(null);
        // Refresh the data after deletion
        window.location.reload(); // Simple refresh for now
      }
    } catch (err) {
      showError("Failed to delete parhaiyan. Please try again.");
    }
  };

  const confirmDelete = (parhaiyan: Parhaiyan) => {
    if (!canDeleteParhaiyan) {
      showError("You don't have permission to delete parhaiyan");
      return;
    }
    setSelectedParhaiyan(parhaiyan);
    setShowDeleteDialog(true);
  };

  const handleEdit = (parhaiyan: Parhaiyan) => {
    if (!canEditParhaiyan) {
      showError("You don't have permission to edit parhaiyan");
      return;
    }
    onEdit(parhaiyan);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  // Client-side search function as fallback
  const getFilteredData = (allData: Parhaiyan[], searchTerm: string) => {
    if (!searchTerm.trim()) return allData;

    return allData.filter(
      (parhaiyan: Parhaiyan) =>
        parhaiyan.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parhaiyan.title_ur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parhaiyan.description_en
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        parhaiyan.description_ur
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  };

  const totalPages = Math.ceil((meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, meta?.total || 0);

  // Check if user has permission to view parhaiyan
  if (!canViewParhaiyan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Access Denied
            </div>
            <p className="text-gray-600 mt-2">
              You don't have permission to view parhaiyan data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading Parhaiyan data
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
              <h1 className="text-2xl font-bold text-gray-900">Parhaiyan</h1>
              <p className="text-gray-600 mt-1">
                Manage parhaiyan sessions and schedules
              </p>
            </div>
            {canCreateParhaiyan && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Parhaiyan
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
                  placeholder="Search by title, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found {data.length} results
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
                <span className="text-gray-600">Loading parhaiyan...</span>
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
                        Title (English)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title (Urdu)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {data?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No parhaiyan found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.map((parhaiyan: Parhaiyan) => (
                        <tr key={parhaiyan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {parhaiyan.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parhaiyan.title_en}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900" dir="rtl">
                              {parhaiyan.title_ur}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parhaiyan.start_date
                                ? format(
                                    new Date(parhaiyan.start_date),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parhaiyan.end_date
                                ? format(
                                    new Date(parhaiyan.end_date),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                parhaiyan.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {parhaiyan.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parhaiyan.created_at
                                ? format(
                                    new Date(parhaiyan.created_at),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {onView && canViewParhaiyan && (
                                <button
                                  onClick={() => onView(parhaiyan)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {canEditParhaiyan && (
                                <button
                                  onClick={() => handleEdit(parhaiyan)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {canDeleteParhaiyan && (
                                <button
                                  onClick={() => confirmDelete(parhaiyan)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
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
              {data && data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of {meta?.total || 0}{" "}
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

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium">
                  {selectedParhaiyan?.title_en}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
    </div>
  );
}

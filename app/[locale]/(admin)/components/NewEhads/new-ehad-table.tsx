"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  ChevronDown,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import {
  useFetchNewEhadsQuery,
  useDeleteNewEhadMutation,
} from "../../../../../store/slicers/newEhadApi";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface NewEhadData {
  id: number;
  name: string;
  father_name: string;
  marfat: string;
  phone_no: string;
  address: string;
  mehfil_directory_id: number;
  zone_id: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: NewEhadData[];
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

interface NewEhadTableProps {
  onEdit: (data: NewEhadData) => void;
  onAdd: () => void;
  onView: (data: NewEhadData) => void;
}

export function NewEhadTable({ onEdit, onAdd, onView }: NewEhadTableProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedMehfil, setSelectedMehfil] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEhad, setSelectedEhad] = useState<NewEhadData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"id" | "name" | "created_at">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Fetch zones and mehfils for filters
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: selectedZone,
    search: "",
  });

  // Fetch new ehads data using RTK Query
  const {
    data: apiResponse,
    isLoading: loading,
    error: fetchError,
    refetch,
  } = useFetchNewEhadsQuery({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch.trim(),
    zone_id: selectedZone || undefined,
    mehfil_directory_id: selectedMehfil || undefined,
  });

  const [deleteNewEhad, { isLoading: isDeleting }] = useDeleteNewEhadMutation();

  // Reset to first page when search, filters, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedZone, selectedMehfil, sortField, sortDirection]);

  const handleSortChange = (field: "id" | "name" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  // Client-side sorting
  const getSortedData = (data: NewEhadData[]) => {
    if (!data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      
      // Handle number comparison (for ID)
      if (sortField === "id") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle date comparison
      if (sortField === "created_at") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
      
      // Convert to string and compare
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const handleDeleteClick = (ehad: NewEhadData) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_NEW_EHADS))) {
      showError("You don't have permission to delete new ehads");
      return;
    }
    setSelectedEhad(ehad);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedEhad) return;

    if (!(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_NEW_EHADS))) {
      showError("You don't have permission to delete new ehads");
      setShowDeleteDialog(false);
      setSelectedEhad(null);
      return;
    }

    try {
      setDeleting(true);
      await deleteNewEhad(selectedEhad.id).unwrap();
      showSuccess("New Ehad deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedEhad(null);
      // Refresh data - RTK Query will automatically refetch due to invalidated tags
      await refetch();
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || "Failed to delete new ehad. Please try again.";
      showError(errorMessage);
      console.error("Error deleting new ehad:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (ehad: NewEhadData) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_NEW_EHADS))) {
      showError("You don't have permission to edit new ehads");
      return;
    }
    if (onEdit) {
      onEdit(ehad);
    }
  };

  const handleView = (ehad: NewEhadData) => {
    if (onView) {
      onView(ehad);
    }
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

  // Permission checks
  const canEditNewEhads = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_NEW_EHADS);
  const canDeleteNewEhads = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_NEW_EHADS);
  const canCreateNewEhads = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_NEW_EHADS);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading new ehads data
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
            <h1 className="text-2xl font-bold text-gray-900">New Ehads</h1>
            <p className="text-gray-600 mt-1">Manage new ehad entries</p>
          </div>
          <div>
            {canCreateNewEhads && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {/* <Plus size={16} /> */}
                Create New Ehad
              </button>
            )}
          </div>
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
                  placeholder="Search new ehads..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
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
                  value={selectedMehfil}
                  onChange={(e) => setSelectedMehfil(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px] max-w-[200px]"
                >
                  <option value="">All Mehfils</option>
                  {mehfilData?.data?.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      {mehfil.address_en}
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
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("id")}
                      >
                        <div className="flex items-center gap-2">
                          <span>ID</span>
                          {sortField === "id" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex items-center gap-2">
                          <span>Name</span>
                          {sortField === "name" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone / Mehfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("created_at")}
                      >
                        <div className="flex items-center gap-2">
                          <span>Created At</span>
                          {sortField === "created_at" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiResponse?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <User className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No new ehads found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first new ehad.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getSortedData(apiResponse?.data || []).map((ehad: NewEhadData) => (
                        <tr key={ehad.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {ehad.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {ehad.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ehad.father_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>
                                {zonesData?.data?.find(
                                  (zone: any) => zone.id === ehad.zone_id
                                )?.title_en || `Zone ${ehad.zone_id}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                Mehfil #{ehad.mehfil_directory_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ehad.phone_no}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(ehad.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-end">
                              <ActionsDropdown
                                // onView={() => handleView(ehad)}
                                onEdit={canEditNewEhads ? () => handleEdit(ehad) : undefined}
                                onDelete={canDeleteNewEhads ? () => handleDeleteClick(ehad) : undefined}
                                // showView={true}
                                showEdit={canEditNewEhads}
                                showDelete={canDeleteNewEhads}
                                align="right"
                              />
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
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete New Ehad"
        message={`Are you sure you want to delete "${selectedEhad?.name}" (ID: ${selectedEhad?.id})? This action cannot be undone.`}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEhad(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

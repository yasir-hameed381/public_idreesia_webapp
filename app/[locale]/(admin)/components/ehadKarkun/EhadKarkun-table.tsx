"use client";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useDeleteKarkunMutation,
  useFetchKarkunsQuery,
} from "../../../../../store/slicers/EhadKarkunApi";
import { KarkunTableProps } from "../../../../types/Ehad-Karkun";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

export function EhadKarkunTable({ onEdit, onAdd }: KarkunTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKarkun, setSelectedKarkun] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Fetch data with pagination and search parameters
  const {
    data: karkunData,
    isLoading,
    error,
    isFetching,
  } = useFetchKarkunsQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
  });

  const [deleteKarkun, { isLoading: isDeleting }] = useDeleteKarkunMutation();

  const confirmDelete = (karkun: any) => {
    setSelectedKarkun(karkun);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedKarkun) return;

    try {
      await deleteKarkun(selectedKarkun.id).unwrap();
      showSuccess("Ehad Karkun deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedKarkun(null);
    } catch (error) {
      showError("Failed to delete Ehad Karkun.");
      console.error("Error deleting data:", error);
    }
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const totalPages = Math.ceil((karkunData?.meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(
    startRecord + perPage - 1,
    karkunData?.meta?.total || 0
  );

  const actionBodyTemplate = (rowData: any) => (
    <div className="flex items-center gap-2">
      {(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_EHAD_KARKUN)) && (
        <button
          onClick={() => onEdit(rowData)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
          title="Edit"
        >
          <Edit size={16} />
        </button>
      )}
      {(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_EHAD_KARKUN)) && (
        <button
          onClick={() => confirmDelete(rowData)}
          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

  const nameBodyTemplate = (rowData: any) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900">
        {rowData.name_en}
      </span>
      <span className="text-xs text-gray-500">{rowData.name_ur}</span>
    </div>
  );

  const soBodyTemplate = (rowData: any) => (
    <div className="flex flex-col">
      <span className="text-sm text-gray-900">{rowData.so_en}</span>
      <span className="text-xs text-gray-500">{rowData.so_ur}</span>
    </div>
  );

  const cityBodyTemplate = (rowData: any) => (
    <div className="flex flex-col">
      <span className="text-sm text-gray-900">{rowData.city_en}</span>
      <span className="text-xs text-gray-500">{rowData.city_ur}</span>
    </div>
  );

  const countryBodyTemplate = (rowData: any) => (
    <div className="flex flex-col">
      <span className="text-sm text-gray-900">{rowData.country_en}</span>
      <span className="text-xs text-gray-500">{rowData.country_ur}</span>
    </div>
  );

  const mobileBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">{rowData.mobile_no}</div>
  );

  const zoneBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">{rowData.zone_id || "N/A"}</div>
  );

  const descriptionBodyTemplate = (rowData: any) => (
    <div
      className="text-sm text-gray-900 max-w-xs truncate"
      title={rowData.description}
    >
      {rowData.description || "N/A"}
    </div>
  );

  const birthYearBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">{rowData.birth_year || "N/A"}</div>
  );

  const ehadYearBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">{rowData.ehad_year || "N/A"}</div>
  );

  const ehadIjazatYearBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">
      {rowData.ehad_ijazat_year || "N/A"}
    </div>
  );

  const cnicBodyTemplate = (rowData: any) => (
    <div className="text-sm text-gray-900">{rowData.cnic || "N/A"}</div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading Ehad Karkun data
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
              <h1 className="text-2xl font-bold text-gray-900">Ehad Karkuns</h1>
              <p className="text-gray-600 mt-1">Manage Ehad Karkun accounts</p>
            </div>
            {(isSuperAdmin ||
              hasPermission(PERMISSIONS.CREATE_EHAD_KARKUN)) && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Add Ehad Karkun
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
                  placeholder="Search by name, mobile, CNIC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found{" "}
                  {karkunData?.data?.length || 0} results
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Records Per Page Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) =>
                      handlePerPageChange(Number(e.target.value))
                    }
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading Ehad Karkuns...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S/O
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CNIC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birth Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ehad Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ehad Ijazat Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {karkunData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No Ehad Karkuns found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first Ehad Karkun.
                            </p>
                            {(isSuperAdmin ||
                              hasPermission(
                                PERMISSIONS.CREATE_EHAD_KARKUN
                              )) && (
                              <button
                                onClick={onAdd}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                              >
                                <Plus size={16} />
                                Add Ehad Karkun
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      karkunData?.data?.map((karkun: any) => (
                        <tr key={karkun.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {zoneBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {nameBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {soBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {mobileBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cnicBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cityBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {countryBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {descriptionBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {birthYearBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ehadYearBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ehadIjazatYearBodyTemplate(karkun)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {karkun.created_at
                                ? (() => {
                                    const date = new Date(karkun.created_at);
                                    return (
                                      date.toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }) +
                                      " - " +
                                      date.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    );
                                  })()
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {karkun.updated_at
                                ? (() => {
                                    const date = new Date(karkun.updated_at);
                                    return (
                                      date.toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }) +
                                      " - " +
                                      date.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    );
                                  })()
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {actionBodyTemplate(karkun)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {karkunData?.data && karkunData.data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of{" "}
                      {karkunData?.meta?.total || 0} results
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
                <span className="font-medium">{selectedKarkun?.name_en}</span>?
                This action cannot be undone.
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

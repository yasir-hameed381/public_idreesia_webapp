"use client";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useDeleteMehfilDirectoryMutation,
  useFetchAddressQuery,
} from "../../../../../store/slicers/mehfildirectoryApi";
import { AddressTableProps } from "../../../../types/Mehfil-Directory";
import { usePagination } from "@/hooks/useTablePagination";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building,
} from "lucide-react";

export function MehfilDirectoryTable({ onEdit, onAdd }: AddressTableProps) {
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [allData, setAllData] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();

  // Fetch data with pagination and search parameters
  const {
    data: addressData,
    isLoading,
    error: apiError,
    refetch,
  } = useFetchAddressQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
  });

  const [deleteMehfilDirectory, { isLoading: isDeleting }] =
    useDeleteMehfilDirectoryMutation();

  // Update data when API response changes
  useEffect(() => {
    if (addressData) {
      setAllData(addressData.data || []);
      setMeta(addressData.meta || {});
      setData(addressData.data || []);
      setLoading(false);
    }
  }, [addressData]);

  // Show error notification
  useEffect(() => {
    if (apiError) {
      setError("Failed to load mehfil directory data");
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
    if (!selectedAddress) return;

    try {
      await deleteMehfilDirectory(selectedAddress.id).unwrap();
      showSuccess("Mehfil directory deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedAddress(null);
      // Refresh the data after deletion
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      showError("Failed to delete mehfil directory. Please try again.");
    }
  };

  const confirmDelete = (address: any) => {
    setSelectedAddress(address);
    setShowDeleteDialog(true);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  // Client-side search function as fallback
  const getFilteredData = (allData: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return allData;

    return allData.filter(
      (address: any) =>
        address.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.name_ur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.address_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.address_ur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.city_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.city_ur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.mehfil_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
              Error loading Mehfil Directory data
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
              <h1 className="text-2xl font-bold text-gray-900">
                Mehfil Directory
              </h1>
              <p className="text-gray-600 mt-1">
                Manage mehfil addresses and contact information
              </p>
            </div>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Add New Address
            </button>
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
                  placeholder="Search by name, address, city, mehfil number..."
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
                <span className="text-gray-600">
                  Loading mehfil directory...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mehfil #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
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
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Building className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No mehfil addresses found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.map((address: any) => (
                        <tr key={address.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {address.mehfil_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {address.name_en}
                              </div>
                              <div className="text-sm text-gray-500" dir="rtl">
                                {address.name_ur}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="text-sm text-gray-900 max-w-xs truncate"
                              title={address.address_en}
                            >
                              {address.address_en}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm text-gray-900">
                                {address.city_en}
                              </div>
                              <div className="text-sm text-gray-500" dir="rtl">
                                {address.city_ur}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-sm text-gray-900">
                              {address.co_phone_number && (
                                <div>CO: {address.co_phone_number}</div>
                              )}
                              {address.zimdar_bhai_phone_number && (
                                <div>
                                  Zimdar: {address.zimdar_bhai_phone_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {address.created_at
                                ? format(
                                    new Date(address.created_at),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEdit(address.id)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => confirmDelete(address)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
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
                <span className="font-medium">{selectedAddress?.name_en}</span>?
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

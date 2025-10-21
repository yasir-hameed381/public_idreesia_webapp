"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import {
  useGetTaleematQuery,
  useAddTaleematMutation,
  useUpdateTaleematMutation,
  useDeleteTaleematMutation,
  type Taleemat,
} from "../../../../../store/slicers/taleematApi";
import { useGetCategoriesQuery } from "@/store/slicers/categoryApi";
import TaleematForm from "./TaleematForm";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

export function TaleematTable() {
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Taleemat | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTaleemat, setSelectedTaleemat] = useState<Taleemat | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const debouncedSearch = useDebounce(searchValue, 500);

  // RTK Query with pagination
  const { data, isLoading, error, isFetching } = useGetTaleematQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const [addTaleemat] = useAddTaleematMutation();
  const [updateTaleemat, { isLoading: isUpdating }] =
    useUpdateTaleematMutation();
  const [deleteTaleemat, { isLoading: isDeleting }] =
    useDeleteTaleematMutation();
  const { data: categoryData } = useGetCategoriesQuery({ page: 1, size: 100 });

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    { label: "Ethics", value: "Ethics" },
    { label: "Aqeedah", value: "Aqeedah" },
    { label: "Quran", value: "Quran" },
    { label: "Fiqh", value: "Fiqh" },
    { label: "Seerah", value: "Seerah" },
    ...(categoryData?.data?.map((cat) => ({
      label: cat.title_en,
      value: cat.id,
    })) || []),
  ];

  // Helper functions
  const statusTemplate = (rowData: any) => {
    const isPublished =
      rowData.is_published === 1 || rowData.is_published === "1";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPublished
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isPublished ? "Published" : "Unpublished"}
      </span>
    );
  };

  // Format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd yyyy h:mma");
    } catch (error) {
      return date; // Return original string if parsing fails
    }
  };

  useEffect(() => {
    if (error) {
      showError("Failed to fetch taleemat data");
    }
  }, [error]);

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (formData: Omit<Taleemat, "id">) => {
    try {
      if (editingItem) {
        await updateTaleemat({
          id: editingItem.id,
          ...formData,
        } as Taleemat).unwrap();
        showSuccess("Taleemat updated successfully");
      } else {
        await addTaleemat(formData).unwrap();
        showSuccess("Taleemat created successfully");
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      showError(
        err?.data?.message ||
          (editingItem
            ? "Failed to update taleemat"
            : "Failed to create taleemat")
      );
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (taleemat: Taleemat) => {
    setEditingItem(taleemat);
    setShowForm(true);
  };

  const confirmDelete = (taleemat: Taleemat) => {
    setSelectedTaleemat(taleemat);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedTaleemat) return;

    try {
      await deleteTaleemat(selectedTaleemat.id).unwrap();
      showSuccess("Taleemat deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedTaleemat(null);
    } catch (err) {
      showError("Failed to delete taleemat. Please try again.");
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  // Handle pagination
  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  if (showForm) {
    return (
      <TaleematForm
        visible={showForm}
        onHide={handleFormCancel}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
      />
    );
  }

  const totalPages = Math.ceil((data?.meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, data?.meta?.total || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Taleemat Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage Islamic teachings and lessons
              </p>
            </div>
            {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_TALEEMAT)) && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Taleemat
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
                  placeholder="Search by title, track..."
                  value={searchValue}
                  onChange={onSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchValue.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{searchValue}" • Found{" "}
                  {data?.data?.length || 0} results
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={onCategoryChange}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

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
          {isLoading || isFetching || isUpdating || isDeleting ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading taleemat...</span>
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
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No taleemat found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((taleemat: any) => (
                        <tr key={taleemat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {taleemat.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {taleemat.title_en}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="text-sm text-gray-900 text-right"
                              dir="rtl"
                            >
                              {taleemat.title_ur}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {(() => {
                                const category = categoryData?.data?.find(
                                  (cat) => cat.id === taleemat.category_id
                                );
                                return category ? category.title_en : "N/A";
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {taleemat.track || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusTemplate(taleemat)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(taleemat.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(taleemat.updated_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_TALEEMAT)) && (
                                <button
                                  onClick={() => handleEdit(taleemat)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_TALEEMAT)) && (
                                <button
                                  onClick={() => confirmDelete(taleemat)}
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
              {data?.data && data.data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of{" "}
                      {data?.meta?.total || 0} results
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
                  {selectedTaleemat?.title_en}
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

"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag,
} from "lucide-react";
import type { Category } from "@/app/types/category";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/store/slicers/categoryApi";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/useTablePagination";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface CategoryTableProps {
  onEdit: (category: Category) => void;
  onAdd: () => void;
}

export function CategoryTable({ onEdit, onAdd }: CategoryTableProps) {
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Use pagination hook
  const { pagination, handlePageChange, getFirstRowIndex } = usePagination({
    initialPerPage: 10,
    searchValue: debouncedSearch,
  });

  // Fetch data with pagination
  const { data, error, isLoading, isFetching } = useGetCategoriesQuery({
    page: pagination.page,
    size: pagination.per_page,
    search: debouncedSearch,
  });

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Error handling
  useEffect(() => {
    if (error) {
      showError("Failed to load categories. Please try again.");
    }
  }, [error]);

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      const categoryId =
        typeof selectedCategory.id === "string"
          ? parseInt(selectedCategory.id, 10)
          : selectedCategory.id;

      await deleteCategory(categoryId).unwrap();
      showSuccess("Category deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error("Delete error:", err);
      showError(
        err?.data?.message || "Failed to delete category. Please try again."
      );
    }
  };

  const confirmDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleTablePageChange = (newPage: number) => {
    handlePageChange({
      page: newPage,
      first: (newPage - 1) * pagination.per_page,
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    handlePageChange({ page: 1, first: 0, per_page: newPerPage });
  };

  const totalPages = Math.ceil((data?.meta?.total || 0) / pagination.per_page);
  const startRecord = (pagination.page - 1) * pagination.per_page + 1;
  const endRecord = Math.min(
    startRecord + pagination.per_page - 1,
    data?.meta?.total || 0
  );

  const dateBodyTemplate = (rowData: any, field: string) => {
    return format(new Date(rowData[field]), "MMM dd yyyy h:mma");
  };

  const urduTitleTemplate = (rowData: Category) => (
    <span dir="rtl" className="font-arabic">
      {rowData.title_ur}
    </span>
  );

  const statusBodyTemplate = (rowData: Category) => {
    const statusValue =
      typeof rowData.status === "string"
        ? parseInt(rowData.status, 10)
        : rowData.status;
    const isActive = statusValue === 1;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading Categories data
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
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">
                Manage categories for organizing taleemat
              </p>
            </div>
            {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_CATEGORIES)) && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Category
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
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found {data?.data?.length || 0}{" "}
                  results
                </div>
              )}
            </div>

            {/* Records Per Page Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <div className="relative">
                <select
                  value={pagination.per_page}
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
          {isLoading || isFetching || isDeleting ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading categories...</span>
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
                        TITLE (ENGLISH)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TITLE (URDU)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SLUG
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CREATED AT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Tag className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No categories found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((category: Category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {category.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {category.title_en}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900" dir="rtl">
                              {category.title_ur}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {category.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusBodyTemplate(category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {dateBodyTemplate(category, "created_at")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {(isSuperAdmin ||
                                hasPermission(PERMISSIONS.EDIT_CATEGORIES)) && (
                                <button
                                  onClick={() => onEdit(category)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(isSuperAdmin ||
                                hasPermission(
                                  PERMISSIONS.DELETE_CATEGORIES
                                )) && (
                                <button
                                  onClick={() => confirmDelete(category)}
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
                        onClick={() =>
                          handleTablePageChange(pagination.page - 1)
                        }
                        disabled={pagination.page === 1}
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
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleTablePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  pagination.page === pageNum
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
                        onClick={() =>
                          handleTablePageChange(pagination.page + 1)
                        }
                        disabled={pagination.page === totalPages}
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
                  {selectedCategory?.title_en}
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

"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Music,
} from "lucide-react";
import { usePagination } from "@/hooks/useTablePagination";
import {
  useFetchNaatSharifDataQuery,
  useCreateNaatSharifMutation,
  useUpdateNaatSharifMutation,
  useDeleteNaatSharifMutation,
} from "../../../../../store/slicers/naatsharifApi";
import { NaatShareef } from "../../../../types/Naat-Taleemat";
import NaatShareefForm from "./naat-shareef-form";
import { useGetCategoriesQuery } from "@/store/slicers/categoryApi";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

export function NaatShareefTable() {
  // State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingItem, setEditingItem] = useState<NaatShareef | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedNaat, setSelectedNaat] = useState<NaatShareef | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const debouncedSearch = useDebounce(search, 500);
  const { user, hasPermission, isSuperAdmin } = usePermissions();
  const canPlayNaats = isSuperAdmin || hasPermission(PERMISSIONS.VIEW_NAATS);
  const canEditNaats = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_NAATS);
  const canDeleteNaats = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_NAATS);

  const { showError, showSuccess } = useToast();

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  // RTK Query hooks
  const { data, isLoading } = useFetchNaatSharifDataQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
    category: selectedCategory,
  });

  const [addNaatSharif] = useCreateNaatSharifMutation();
  const [updateNaatSharif] = useUpdateNaatSharifMutation();
  const [deleteNaatSharif, { isLoading: isDeleting }] =
    useDeleteNaatSharifMutation();

  const { data: categoryData } = useGetCategoriesQuery({
    page: 1,
    size: 25,
    search: "",
  });

  // Category options
  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...(categoryData?.data || []).map((cat) => ({
      label: cat.title_en,
      value: cat.id.toString(),
    })),
  ];

  // Functions
  const openNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const hideForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleAddNewData = async (formData) => {
    try {
      const response = await addNaatSharif(formData).unwrap();
      return response;
    } catch (error) {
      console.error("Error creating data:", error);
      throw error;
    }
  };

  const handleUpdateData = async (formData) => {
    if (!editingItem) return null;

    try {
      const response = await updateNaatSharif({
        id: editingItem.id,
        ...formData,
      }).unwrap();

      return response;
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
  };

  const handlePlay = (naat: NaatShareef & { filepath?: string }) => {
    if (naat.filepath) {
      window.open(naat.filepath, "_blank", "noopener,noreferrer");
    }
  };

  const editNaatShareef = (naatShareef: NaatShareef) => {
    setEditingItem(naatShareef);
    setShowForm(true);
  };

  const handleDeleteClick = (naatShareef: NaatShareef) => {
    setSelectedNaat(naatShareef);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedNaat) return;

    try {
      await deleteNaatSharif(selectedNaat.id).unwrap();
      showSuccess("Naat Shareef deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedNaat(null);
    } catch (error) {
      showError("Failed to delete Naat Shareef.");
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

  // Render status badge
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
    return new Date(date).toLocaleDateString();
  };

  // Get user name by ID using current user from permissions
  const getUserName = (userId: number | undefined) => {
    console.log("getUserName called with userId:", userId);
    console.log("Current user from permissions:", user);

    if (!userId) return "N/A";

    // If it's the current user, return their name
    if (user && user.id === userId) {
      console.log("Matched current user, returning:", user.name || user.email);
      return user.name || user.email;
    }

    // For other users, you can expand this with actual user data from API
    // For now, return a generic name with the user ID
    console.log("Not current user, returning:", `User ${userId}`);
    return `User ${userId}`;
  };

  if (showForm) {
    return (
      <NaatShareefForm
        type={editingItem ? "Edit Naat Shareef" : "Add Naat Shareef"}
        customFieldLabels={{}}
        onCancel={hideForm}
        onAddNewData={handleAddNewData}
        editingItem={editingItem}
        onUpdateData={handleUpdateData}
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
                Naat Shareefs
              </h1>
              <p className="text-gray-600 mt-1">
                Manage naat shareef recordings
              </p>
            </div>
            {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_NAATS)) && (
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Naat
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
                  placeholder="Search by title, slug, category..."
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

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categoryData?.data?.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.title_en}
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
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading naat shareefs...</span>
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
                        Slug
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
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Music className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No naat shareefs found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((naat: any) => {
                        console.log("Naat record:", naat);
                        console.log(
                          "Created by:",
                          naat.created_by,
                          "Updated by:",
                          naat.updated_by
                        );
                        return (
                          <tr key={naat.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {naat.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {naat.slug}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {naat.title_en}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className="text-sm text-gray-900 text-right"
                                dir="rtl"
                              >
                                {naat.title_ur}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(() => {
                                  const category = categoryData?.data?.find(
                                    (cat) =>
                                      cat.id.toString() ===
                                      naat.category_id?.toString()
                                  );
                                  return category
                                    ? category.title_en
                                    : "Old Naat Shareef";
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {naat.track || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {statusTemplate(naat)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {naat.created_at
                                  ? (() => {
                                      const date = new Date(naat.created_at);
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
                                {getUserName(naat.created_by)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {getUserName(naat.updated_by)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center justify-end">
                                <ActionsDropdown
                                  onPlay={
                                    canPlayNaats && naat.filepath
                                      ? () => handlePlay(naat)
                                      : undefined
                                  }
                                  onEdit={
                                    canEditNaats
                                      ? () => editNaatShareef(naat)
                                      : undefined
                                  }
                                  onDelete={
                                    canDeleteNaats
                                      ? () => handleDeleteClick(naat)
                                      : undefined
                                  }
                                  showPlay={!!(canPlayNaats && naat.filepath)}
                                  showEdit={canEditNaats}
                                  showDelete={canDeleteNaats}
                                  align="right"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
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

        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Confirm Delete"
          message={
            selectedNaat
              ? `Are you sure you want to delete "${selectedNaat.title_en}"? This action cannot be undone.`
              : ""
          }
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedNaat(null);
          }}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}

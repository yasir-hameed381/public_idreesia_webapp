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
  MoreHorizontal,
  Eye,
  Calendar,
} from "lucide-react";
import { Wazaif, WazaifTableProps } from "../../../../types/wazif";
import WazaifForm from "./wazaif-form";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

const WazaifTable: React.FC<WazaifTableProps & { onSearchChange: (s: string) => void; onCategoryChange: (c: string) => void; selectedCategory: string; search: string }> = ({
  data,
  isLoading,
  error,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting,
  selectedWazaif,
  onSelectionChange,
  onSearchChange,
  onCategoryChange,
  selectedCategory,
  search,
}) => {
  // Local state for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wazaifToDelete, setWazaifToDelete] = useState<Wazaif | null>(null);
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  // Form state management
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Wazaif | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdownId &&
        !(event.target as Element).closest(".actions-dropdown")
      ) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownId]);

  const toggleDropdown = (id: number) => {
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  // Helper functions
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch (error) {
      return date;
    }
  };

  const confirmDelete = (wazaif: Wazaif) => {
    setWazaifToDelete(wazaif);
    setShowDeleteDialog(true);
    setActiveDropdownId(null);
  };

  const hideDeleteDialog = () => {
    setShowDeleteDialog(false);
    setWazaifToDelete(null);
  };

  const executeDelete = () => {
    if (wazaifToDelete?.id) {
      onDelete(wazaifToDelete.id);
      setShowDeleteDialog(false);
      setWazaifToDelete(null);
    }
  };

  // Handle pagination
  const handleTablePageChange = (newPage: number) => {
    onPageChange({
      page: newPage - 1,
      first: (newPage - 1) * pageSize,
      rows: pageSize,
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    onPageChange({ page: 0, first: 0, rows: newPerPage });
  };

  // Form management functions
  const openNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const hideForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const editWazaif = (wazaif: Wazaif) => {
    setEditingItem(wazaif);
    setShowForm(true);
    setActiveDropdownId(null);
  };

  const handleView = (wazaif: Wazaif) => {
    // Logic to view the first image or PDF
    if (wazaif.images) {
      const images = Array.isArray(wazaif.images)
        ? wazaif.images
        : wazaif.images.split(",");
      if (images.length > 0) {
        window.open(images[0], "_blank");
      }
    }
    setActiveDropdownId(null);
  };

  const handleAddNewData = async (formData: any) => {
    try {
      await onEdit(formData);
      return formData;
    } catch (error) {
      console.error("Error creating data:", error);
      throw error;
    }
  };

  const handleUpdateData = async (formData: any) => {
    if (!editingItem) return null;
    try {
      await onEdit({ ...editingItem, ...formData });
      return formData;
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
  };

  const currentPage = page + 1;
  const totalPages = Math.ceil((data?.meta?.total || 0) / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, data?.meta?.total || 0);

  const statusTemplate = (wazaif: Wazaif) => {
    const isPublished = wazaif.is_published === 1 || wazaif.is_published === true;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublished
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
          }`}
      >
        {isPublished ? "Published" : "Unpublished"}
      </span>
    );
  };

  const categoryLabel = (cat: string | undefined) => {
    const options: Record<string, string> = {
      bunyadi: "Bunyadi Wazaif",
      notice_board_taleem: "Notice Bord Taleem",
      parhaiyan: "Parhaiyan",
      wazaif: "Wazaif",
    };
    return cat ? options[cat] || cat : "N/A";
  };

  // Show form instead of table when form is open
  if (showForm) {
    return (
      <WazaifForm
        type={editingItem ? "Edit Wazaif" : "Add Wazaif"}
        customFieldLabels={{}}
        onCancel={hideForm}
        onAddNewData={handleAddNewData}
        editingItem={editingItem}
        onUpdateData={handleUpdateData}
      />
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
                Wazaif Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage Islamic supplications and prayers
              </p>
            </div>
            {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_WAZAIFS)) && (
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Wazaif
              </button>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by title, description..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="bunyadi">Bunyadi Wazaif</option>
                  <option value="notice_board_taleem">Notice Bord Taleem</option>
                  <option value="parhaiyan">Parhaiyan</option>
                  <option value="wazaif">Wazaif</option>
                </select>
              </div>

              {/* Records Per Page Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Show:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePerPageChange(Number(e.target.value))
                    }
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {isLoading || isDeleting ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading wazaif...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Failed to load data. Please try again.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Wazaif #</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title (English)</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Title (Urdu)</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No wazaif found</h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((wazaif: Wazaif) => (
                        <tr key={wazaif.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wazaif.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wazaif.wazaif_number || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]">{wazaif.title_en}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-urdu" dir="rtl">{wazaif.title_ur}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoryLabel(wazaif.category)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{statusTemplate(wazaif)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(wazaif.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                            <div className="relative actions-dropdown">
                              <button
                                onClick={() => wazaif.id && toggleDropdown(wazaif.id)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <MoreHorizontal size={20} />
                              </button>

                              {activeDropdownId === wazaif.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1">
                                  <button
                                    onClick={() => handleView(wazaif)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>

                                  {(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_WAZAIFS)) && (
                                    <button
                                      onClick={() => editWazaif(wazaif)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit size={14} />
                                      Edit
                                    </button>
                                  )}

                                  {(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_WAZAIFS)) && (
                                    <button
                                      onClick={() => confirmDelete(wazaif)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  )}
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
              {data?.meta && data.meta.total > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startRecord} to {endRecord} of {data.meta.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTablePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i));
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleTablePageChange(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum ? "bg-gray-900 text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleTablePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{wazaifToDelete?.title_en}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={hideDeleteDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                <button onClick={executeDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50">{isDeleting ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WazaifTable;

"use client";

import React, { useState } from "react";
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
import { Wazaif, WazaifTableProps } from "../../../../types/wazif";
import WazaifForm from "./wazaif-form";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

const WazaifTable: React.FC<WazaifTableProps> = ({
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
}) => {
  // Local state for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wazaifToDelete, setWazaifToDelete] = useState<Wazaif | null>(null);
  const [search, setSearch] = useState("");
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [currentPage, setCurrentPage] = useState(page + 1);
  const [perPage, setPerPage] = useState(pageSize);

  // Form state management
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Wazaif | null>(null);

  // Helper functions
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd yyyy h:mma");
    } catch (error) {
      return date; // Return original string if parsing fails
    }
  };

  const confirmDelete = (wazaif: Wazaif) => {
    setWazaifToDelete(wazaif);
    setShowDeleteDialog(true);
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
    setCurrentPage(newPage);
    onPageChange({
      page: newPage - 1,
      first: (newPage - 1) * perPage,
      rows: perPage,
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
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

  const totalPages = Math.ceil((data?.meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, data?.meta?.total || 0);

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
                  Searching for: "{search}" • Found {data?.data?.length || 0}{" "}
                  results
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
          {isLoading || isDeleting ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading wazaif...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500">
                Failed to load data. Please try again.
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
                        Description
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
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No wazaif found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((wazaif: any) => (
                        <tr key={wazaif.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {wazaif.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {wazaif.title_en}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="text-sm text-gray-900 text-right"
                              dir="rtl"
                            >
                              {wazaif.title_ur}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {wazaif.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {wazaif.created_by || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {wazaif.updated_by || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_WAZAIFS)) && (
                                <button
                                  onClick={() => editWazaif(wazaif)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_WAZAIFS)) && (
                                <button
                                  onClick={() => confirmDelete(wazaif)}
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
                <span className="font-medium">{wazaifToDelete?.title_en}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={hideDeleteDialog}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WazaifTable;

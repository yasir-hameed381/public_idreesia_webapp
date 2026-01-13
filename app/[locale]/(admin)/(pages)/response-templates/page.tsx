"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import ResponseTemplatesService, { ResponseTemplate } from "@/services/ResponseTemplates";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import ActionsDropdown from "@/components/ActionsDropdown";

const ResponseTemplatesPage = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<"id" | "title" | "created_at" | "updated_at">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ResponseTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, sortField, sortDirection]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await ResponseTemplatesService.getResponseTemplates({
        page,
        size: pageSize,
        search,
        sortField,
        sortDirection,
      });
      setTemplates(response.data);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
      if (page > response.totalPages && response.totalPages > 0) {
        setPage(response.totalPages);
      }
    } catch (error: any) {
      console.error("Error loading response templates:", error);
      toast.error(error?.response?.data?.message || "Failed to load response templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (template: ResponseTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      setDeleting(true);
      await ResponseTemplatesService.deleteResponseTemplate(templateToDelete.id);
      toast.success("Template deleted successfully");
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
      await loadTemplates();
    } catch (error: any) {
      console.error("Failed to delete template", error);
      toast.error(error?.response?.data?.message || "Failed to delete template");
    } finally {
      setDeleting(false);
    }
  };

  const handleSortChange = (field: "id" | "title" | "created_at" | "updated_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "id" || field === "title" ? "asc" : "desc");
    }
  };

  const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_RESPONSE_TEMPLATES);
  const canDelete = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_RESPONSE_TEMPLATES);
  const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.UPDATE_RESPONSE_TEMPLATES);

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_RESPONSE_TEMPLATES}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Response Templates</h1>
              <p className="text-gray-600">Manage response templates for Khatoot/Masail</p>
            </div>
            {canCreate && (
              <Link
                href={`/${locale}/response-templates/create`}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                + Create Template
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search templates..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
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
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange("title")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Title</span>
                        {sortField === "title" && (
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
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        Loading templates...
                      </td>
                    </tr>
                  ) : templates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No templates found
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {template.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{template.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {template.created_at
                            ? new Date(template.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end">
                            <ActionsDropdown
                              onEdit={
                                canEdit
                                  ? () => router.push(`/${locale}/response-templates/${template.id}/edit`)
                                  : undefined
                              }
                              onDelete={canDelete ? () => handleDeleteClick(template) : undefined}
                              showEdit={canEdit}
                              showDelete={canDelete}
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
          </div>

          {!loading && templates.length > 0 && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {templates.length > 0 ? (page - 1) * pageSize + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`px-3 py-2 text-sm border-r border-gray-300 ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                >
                  &lt;
                </button>
                {(() => {
                  const getPageNumbers = () => {
                    const pages: (number | string)[] = [];
                    const delta = 1; // Show 1 page on each side of current
                    
                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      let start = Math.max(2, page - delta);
                      let end = Math.min(totalPages - 1, page + delta);
                      
                      // Adjust if we're near the start
                      if (page <= 3) {
                        end = Math.min(5, totalPages - 1);
                      }
                      
                      // Adjust if we're near the end
                      if (page >= totalPages - 2) {
                        start = Math.max(2, totalPages - 4);
                      }
                      
                      // Add ellipsis after first page if needed
                      if (start > 2) {
                        pages.push("ellipsis-start");
                      }
                      
                      // Add page numbers around current
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      
                      // Add ellipsis before last page if needed
                      if (end < totalPages - 1) {
                        pages.push("ellipsis-end");
                      }
                      
                      // Always show last page
                      if (totalPages > 1) {
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages;
                  };
                  
                  const pageNumbers = getPageNumbers();
                  
                  return pageNumbers.map((pageNum, index) => {
                    if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-2 text-sm text-gray-500 border-r border-gray-300"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum as number)}
                        className={`px-3 py-2 text-sm border-r border-gray-300 ${
                          index === pageNumbers.length - 1 ? "last:border-r-0" : ""
                        } ${
                          page === pageNum
                            ? "bg-indigo-600 text-white font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className={`px-3 py-2 text-sm ${
                    page === totalPages
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Template"
          message="Are you sure you want to delete this template? This action cannot be undone."
          onClose={() => {
            setShowDeleteDialog(false);
            setTemplateToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleting}
        />
      </div>
    </PermissionWrapper>
  );
};

export default ResponseTemplatesPage;


"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useFetchCommitteesQuery,
  useDeleteCommitteeMutation,
} from "../../../../../store/slicers/committeesApi";
import type { Committee } from "@/types/committee";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

export interface CommitteeTableProps {
  onEdit: (id: number | string) => void;
  onAdd: () => void;
  onManageMembers: (id: number | string) => void;
}

export function CommitteeTable({ onEdit, onAdd, onManageMembers }: CommitteeTableProps) {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const { showError, showSuccess } = useToast();

  const {
    data: committeesData,
    isLoading,
    error,
    refetch,
  } = useFetchCommitteesQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearch,
  });

  const [deleteCommittee] = useDeleteCommitteeMutation();

  const data = committeesData?.data ?? [];
  const meta = committeesData?.meta;
  const total = meta?.total ?? 0;
  const totalPages = Math.ceil(total / perPage) || 1;
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, total);
  const canCreateCommittee = hasPermission(PERMISSIONS.CREATE_COMMITTEES);
  const canEditCommittee = hasPermission(PERMISSIONS.EDIT_COMMITTEES);
  const canDeleteCommittee = hasPermission(PERMISSIONS.DELETE_COMMITTEES);
  const canManageCommitteeMembers = hasPermission(PERMISSIONS.MANAGE_COMMITTEE_MEMBERS);
  const canShowActions = canEditCommittee || canDeleteCommittee || canManageCommitteeMembers;

  const handleDeleteClick = (committee: Committee) => {
    if (!canDeleteCommittee) {
      showError("You don't have permission to delete committees");
      return;
    }
    setSelectedCommittee(committee);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedCommittee) return;
    if (!canDeleteCommittee) {
      setShowDeleteDialog(false);
      setSelectedCommittee(null);
      return;
    }
    try {
      setDeleting(true);
      const result = await deleteCommittee(selectedCommittee.id).unwrap();
      if (result.success) {
        showSuccess("Committee deleted successfully.");
        setShowDeleteDialog(false);
        setSelectedCommittee(null);
        await refetch();
      } else {
        showError((result as { message?: string }).message || "Delete failed.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete committee.";
      showError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (committee: Committee) => {
    if (!canEditCommittee) {
      showError("You don't have permission to edit committees");
      return;
    }
    onEdit(committee.id);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading committees
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
              <p className="text-gray-600 mt-1">
                Manage committees and their members
              </p>
            </div>
            {canCreateCommittee && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Committee
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search committees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none -ml-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                <span className="text-gray-600">Loading committees...</span>
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      {canShowActions && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={canShowActions ? 7 : 6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No committees found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.map((row: Committee) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.id}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${row.is_sub_committee ? "pl-12" : ""}`}
                          >
                            {row.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row.is_sub_committee ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                {`Sub committee of ${row.parent_name || "Parent Committee"}`}
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Parent
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {row.members_count ?? 0} members
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row.is_active ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.created_at
                              ? format(new Date(row.created_at), "MMM dd, yyyy")
                              : "N/A"}
                          </td>
                          {canShowActions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <ActionsDropdown
                                onEdit={canEditCommittee ? () => handleEdit(row) : undefined}
                                onDelete={canDeleteCommittee ? () => handleDeleteClick(row) : undefined}
                                onManageMembers={
                                  canManageCommitteeMembers ? () => onManageMembers(row.id) : undefined
                                }
                                showEdit={canEditCommittee}
                                showDelete={canDeleteCommittee}
                                showManageMembers={canManageCommitteeMembers}
                                align="right"
                                openDown
                              />
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {data.length > 0 && totalPages > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of {total} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          title="Delete Committee"
          message={`Are you sure you want to delete "${selectedCommittee?.name}"? This action cannot be undone.`}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedCommittee(null);
          }}
          onConfirm={handleDelete}
          isLoading={deleting}
        />
      </div>
    </div>
  );
}

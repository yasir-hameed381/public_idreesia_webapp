"use client";
import React, { useState, useEffect } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { ScrollPanel } from "primereact/scrollpanel";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  Eye,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/useTablePagination";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { deleteRole, fetchRoles } from "@/services/Roles/roles-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

import { Role } from "@/types/Role";

interface RolesTableProps {
  onEdit: (data: any) => void;
  onAdd: () => void;
}

const RolesTable: React.FC<RolesTableProps> = ({ onEdit, onAdd }) => {
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { hasPermission, isSuperAdmin, user } = usePermissions();

  // Debug logging for role permissions
  console.log("🔍 Role Table Permission Debug:", {
    isSuperAdmin,
    hasCreateRoles: hasPermission(PERMISSIONS.CREATE_ROLES),
    hasEditRoles: hasPermission(PERMISSIONS.EDIT_ROLES),
    hasDeleteRoles: hasPermission(PERMISSIONS.DELETE_ROLES),
    userRole: user?.role?.name,
    userPermissions: user?.role?.permissions?.map((p) => p.name) || [],
    createRolesPermission: PERMISSIONS.CREATE_ROLES,
    editRolesPermission: PERMISSIONS.EDIT_ROLES,
    deleteRolesPermission: PERMISSIONS.DELETE_ROLES,
  });

  // Check if user has any role management permissions
  const hasAnyRolePermission =
    isSuperAdmin ||
    hasPermission(PERMISSIONS.CREATE_ROLES) ||
    hasPermission(PERMISSIONS.EDIT_ROLES) ||
    hasPermission(PERMISSIONS.DELETE_ROLES);

  console.log("🔍 Has any role permission:", hasAnyRolePermission);

  // Use pagination hook
  const { pagination, handlePageChange, getFirstRowIndex } = usePagination({
    initialPerPage: 10,
    searchValue: debouncedSearch,
  });

  // Fetch roles using the service
  const fetchRolesData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchRoles({
        page: currentPage,
        size: perPage,
        search: debouncedSearch || undefined,
      });
      console.log("response", response.data);

      setRoles(
        (response.data || []).map((role) => ({
          ...role,
          permissions: role.permissions || [],
        }))
      );
      setTotalRecords(response.meta?.total || 0);
    } catch (err) {
      setError("Error loading roles data");
      console.error("Error fetching roles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch roles when pagination or search changes
  useEffect(() => {
    fetchRolesData();
  }, [currentPage, perPage, debouncedSearch]);

  const handleEdit = (role: Role) => {
    sessionStorage.setItem("editRole", JSON.stringify(role));
    onEdit(role);
  };

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsDialog(true);
  };

  const confirmDelete = (role: Role) => {
    confirmDialog({
      message: `Are you sure you want to delete the role "${role.name}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteRole(role.id);
          showSuccess("Role deleted successfully.");
          fetchRolesData();
        } catch (error) {
          showError("Failed to delete role.");
          console.error("Error:", error);
        }
      },
    });
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };
  const totalPages = Math.ceil(totalRecords / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, totalRecords);

  // Template functions
  const permissionsBodyTemplate = (role: Role) => {
    const permissions = role.permissions || [];
    const displayCount = 3;
    const hasMore = permissions.length > displayCount;

    return (
      <div className="flex flex-wrap gap-1">
        {permissions.slice(0, displayCount).map((permission) => (
          <Badge key={permission.id} value={permission.name} severity="info" />
        ))}
        {hasMore && (
          <Badge
            value={`+${permissions.length - displayCount} more`}
            severity="secondary"
          />
        )}
        {permissions.length > 0 && (
          <button
            onClick={() => handleViewPermissions(role)}
            className="text-blue-600 hover:text-blue-800 text-xs underline"
          >
            View All
          </button>
        )}
      </div>
    );
  };

  const dateBodyTemplate = (role: Role, field: string) => {
    const date = role[field as keyof Role] as string;
    if (!date) return "-";

    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return date;
    }
  };

  const renderPermissionsDialog = () => {
    if (!selectedRole) return null;

    const permissions = selectedRole.permissions || [];

    const groupedPermissions = permissions.reduce(
      (acc: { [key: string]: typeof permissions }, permission) => {
        const action = permission.name.split(" ")[0];
        const capitalizedAction =
          action.charAt(0).toUpperCase() + action.slice(1);

        if (!acc[capitalizedAction]) {
          acc[capitalizedAction] = [];
        }
        acc[capitalizedAction].push(permission);
        return acc;
      },
      {}
    );

    return (
      <Dialog
        header={`Permissions for "${selectedRole.name}"`}
        visible={showPermissionsDialog}
        onHide={() => setShowPermissionsDialog(false)}
        style={{ width: "70vw", maxWidth: "800px" }}
        modal
        closable
      >
        <div className="space-y-4">
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No permissions assigned to this role.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Permissions:
                  </span>
                  <Badge
                    value={permissions.length.toString()}
                    severity="info"
                    size="large"
                  />
                </div>
              </div>

              <ScrollPanel style={{ width: "100%", height: "400px" }}>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(
                    ([action, actionPermissions]) => (
                      <div
                        key={action}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          {action} Permissions
                          <Badge
                            value={actionPermissions.length.toString()}
                            severity="secondary"
                          />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {actionPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">
                                {permission.name.replace(/^[a-z]/, (str) =>
                                  str.toUpperCase()
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollPanel>
            </>
          )}
        </div>
      </Dialog>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading roles data
            </div>
            <p className="text-gray-600 mt-2">Please try refreshing the page</p>
            <button
              onClick={fetchRolesData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ConfirmDialog />
        {renderPermissionsDialog()}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left: Create Role */}
              <div>
                {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_ROLES)) && (
                  <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <Plus size={16} />
                    Create Role
                  </button>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search roles..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Records Per Page */}
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-2 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role ID
                      </th>
                      <th className="px-2 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-2 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-2 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-2 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Shield className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No roles found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by creating your first role.
                            </p>
                            {(isSuperAdmin ||
                              hasPermission(PERMISSIONS.CREATE_ROLES)) && (
                              <button
                                onClick={onAdd}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                              >
                                <Plus size={16} />
                                Create Role
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      roles?.map((role: Role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {role.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {role.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              {permissionsBodyTemplate(role)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {dateBodyTemplate(role, "created_at")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {(isSuperAdmin ||
                                hasPermission(PERMISSIONS.EDIT_ROLES)) && (
                                <button
                                  onClick={() => handleEdit(role)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(isSuperAdmin ||
                                hasPermission(PERMISSIONS.DELETE_ROLES)) && (
                                <button
                                  onClick={() => confirmDelete(role)}
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
              {roles && roles.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of {totalRecords}{" "}
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
    </div>
  );
};

export default RolesTable;

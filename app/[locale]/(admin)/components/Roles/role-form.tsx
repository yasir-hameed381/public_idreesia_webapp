"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Role } from "@/types/Role";
import { Permission } from "@/types/permission";
import { permissionsService } from "@/services/Permissions/permissions-service";
import { createRole, updateRole } from "@/services/Roles/roles-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface RoleFormProps {
  role?: Role | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

type FormValues = {
  name: string;
  permissions: number[];
};

// Group permissions by action type
const groupPermissionsByAction = (permissions: Permission[]) => {
  const groups: { [key: string]: Permission[] } = {
    Create: [],
    Delete: [],
    Edit: [],
    Generate: [],
    Manage: [],
    Upload: [],
    View: [],
  };

  permissions.forEach((permission) => {
    const action = permission.name.split(" ")[0];
    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

    if (groups[capitalizedAction]) {
      groups[capitalizedAction].push(permission);
    } else if (capitalizedAction === "Upload") {
      groups["Upload"].push(permission);
    } else if (capitalizedAction === "Generate") {
      groups["Generate"].push(permission);
    } else if (capitalizedAction === "Manage") {
      groups["Manage"].push(permission);
    }
  });

  return groups;
};

const RoleForm: React.FC<RoleFormProps> = ({ role, onCancel, onSuccess }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { hasPermission, isSuperAdmin, user } = usePermissions();

  // Debug logging for role form permissions
  console.log("🔍 Role Form Permission Debug:", {
    isSuperAdmin,
    hasCreateRoles: hasPermission(PERMISSIONS.CREATE_ROLES),
    hasEditRoles: hasPermission(PERMISSIONS.EDIT_ROLES),
    userRole: user?.role?.name,
    userPermissions: user?.role?.permissions?.map((p) => p.name) || [],
    isEditing: !!role,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: role?.name || "",
      permissions: role?.permissions?.map((p) => p.id) || [],
    },
  });

  // Fetch permissions
  const fetchPermissionsData = async () => {
    try {
      setPermissionsLoading(true);
      setPermissionsError(null);

      // Always fetch all permissions from API (for both create and edit)
      console.log("Fetching all permissions from API");
      const response = await permissionsService.getPermissions();
      console.log("Fetched permissions:", response.length);
      setPermissions(response);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissionsError("Failed to load permissions");
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Load permissions on component mount
  useEffect(() => {
    fetchPermissionsData();
  }, [role]);

  const watchedPermissions = watch("permissions");
  const permissionGroups = groupPermissionsByAction(permissions);

  // Reset form when role prop changes
  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        permissions: role.permissions?.map((p) => p.id) || [],
      });
    }
  }, [role, reset]);

  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allPermissionIds = permissions.map((p) => p.id);
      setValue("permissions", allPermissionIds);
    } else {
      setValue("permissions", []);
    }
  };

  // Handle group selection
  const handleGroupSelect = (groupName: string, checked: boolean) => {
    const groupPermissions = permissionGroups[groupName] || [];
    const currentPermissions = watchedPermissions || [];

    if (checked) {
      const newPermissions = [
        ...new Set([
          ...currentPermissions,
          ...groupPermissions.map((p) => p.id),
        ]),
      ];
      setValue("permissions", newPermissions);
    } else {
      const newPermissions = currentPermissions.filter(
        (p) => !groupPermissions.map((perm) => perm.id).includes(p)
      );
      setValue("permissions", newPermissions);
    }
  };

  // Check if all permissions in a group are selected
  const isGroupSelected = (groupName: string) => {
    const groupPermissions = permissionGroups[groupName] || [];
    return groupPermissions.every((p) =>
      (watchedPermissions || []).includes(p.id)
    );
  };

  // Form submission
  const onFormSubmit = async (data: FormValues) => {
    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_ROLES);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_ROLES);

      if (role && !canEdit) {
        showError("You don't have permission to edit roles.");
        return;
      }

      if (!role && !canCreate) {
        showError("You don't have permission to create roles.");
        return;
      }

      setIsSubmitting(true);
      console.log("Submitting role data:", {
        name: data.name,
        permissionsCount: data.permissions.length,
      });

      const roleData = {
        name: data.name,
        permissions: data.permissions,
      };

      if (role) {
        await updateRole(role.id, roleData as any);
        showSuccess("Role updated successfully.");
      } else {
        await createRole(roleData as any);
        showSuccess("Role created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/roles");
      }
    } catch (error) {
      showError(role ? "Failed to update role." : "Failed to create role.");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-500 text-lg font-medium">
              Loading permissions...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              {permissionsError}
            </div>
            <button
              onClick={fetchPermissionsData}
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/roles")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft size={20} />
            Back to Roles
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {role ? "Edit Role" : "Create Role"}
          </h1>
          <p className="text-gray-600 mt-1">
            {role
              ? "Update role information and permissions"
              : "Create a new role with specific permissions"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            {/* Role Name Section */}
            <div className="space-y-2 mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Role Name *
              </label>
              <InputText
                id="name"
                {...register("name", { required: "Role Name is required." })}
                className={classNames("w-full p-3 border rounded-lg", {
                  "border-red-500": !!errors.name,
                  "border-gray-300": !errors.name,
                })}
                placeholder="Enter role name"
                aria-describedby="name-error"
              />
              {errors.name && (
                <small id="name-error" className="text-red-600 text-sm">
                  {errors.name.message}
                </small>
              )}
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Permissions *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>

              <Controller
                name="permissions"
                control={control}
                rules={{
                  validate: (value) =>
                    value.length > 0 || "At least one permission is required.",
                }}
                render={({ field }) => (
                  <div className="space-y-4">
                    {/* Grid layout for permission cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Top row - Create, Delete, Edit */}
                      {["Create", "Delete", "Edit"].map((groupName) => (
                        <div
                          key={groupName}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={isGroupSelected(groupName)}
                              onChange={(e) =>
                                handleGroupSelect(groupName, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <h3 className="text-sm font-medium text-gray-900">
                              {groupName}
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {(permissionGroups[groupName] || []).map(
                              (permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(field.value || []).includes(
                                      permission.id
                                    )}
                                    onChange={(e) => {
                                      const currentPermissions =
                                        field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...currentPermissions,
                                          permission.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentPermissions.filter(
                                            (p) => p !== permission.id
                                          )
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {permission.name.replace(/^[a-z]/, (str) =>
                                      str.toUpperCase()
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Middle row - Generate, Manage, Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Generate", "Upload"].map((groupName) => (
                        <div
                          key={groupName}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={isGroupSelected(groupName)}
                              onChange={(e) =>
                                handleGroupSelect(groupName, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <h3 className="text-sm font-medium text-gray-900">
                              {groupName}
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {(permissionGroups[groupName] || []).map(
                              (permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(field.value || []).includes(
                                      permission.id
                                    )}
                                    onChange={(e) => {
                                      const currentPermissions =
                                        field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...currentPermissions,
                                          permission.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentPermissions.filter(
                                            (p) => p !== permission.id
                                          )
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {permission.name.replace(/^[a-z]/, (str) =>
                                      str.toUpperCase()
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom row - View (large card) */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={isGroupSelected("View")}
                          onChange={(e) =>
                            handleGroupSelect("View", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <h3 className="text-sm font-medium text-gray-900">
                          View
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {(permissionGroups["View"] || []).map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={(field.value || []).includes(
                                permission.id
                              )}
                              onChange={(e) => {
                                const currentPermissions = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([
                                    ...currentPermissions,
                                    permission.id,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentPermissions.filter(
                                      (p) => p !== permission.id
                                    )
                                  );
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.name.replace(/^[a-z]/, (str) =>
                                str.toUpperCase()
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {errors.permissions && (
                      <small className="text-red-600 text-sm">
                        {errors.permissions.message}
                      </small>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <Button
              type="button"
              label="Cancel"
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onCancel}
            />
            <Button
              type="submit"
              label={role ? "Update Role" : "Create Role"}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white border-0"
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                (role &&
                  !(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_ROLES))) ||
                (!role &&
                  !(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_ROLES)))
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;

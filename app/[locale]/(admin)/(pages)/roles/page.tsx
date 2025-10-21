"use client";
import React from "react";
import { Button } from "primereact/button";
import RolesTable from "../../components/Roles/role-table";
import { useRouter } from "next/navigation";
import { Role } from "../../../../../types/Role";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

const RolesPage: React.FC = () => {
  const router = useRouter();

  const handleAdd = () => {
    router.push("/roles/new");
  };

  const handleEdit = (role: Role) => {
    router.push(`/roles/${role.id}`);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_ROLES}>
      <div className="p-2 space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user roles and their permissions
          </p>
        </div>

        {/* Roles Table */}
        <RolesTable onEdit={handleEdit} onAdd={handleAdd} />
      </div>
    </PermissionWrapper>
  );
};

export default RolesPage;

"use client";
import { useState, useEffect } from "react";
import { AdminUserTable } from "@/app/[locale]/(admin)/components/Admin-Users/adminUser-table";
import { AdminUserForm } from "@/app/[locale]/(admin)/components/Admin-Users/adminUser-form";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    // Trigger table refresh by incrementing refreshTrigger
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_USERS}>
      <div className="space-y-6">
        {showForm ? (
          <AdminUserForm
            onSuccess={handleSuccess}
            editingUser={editingUser}
            onCancel={handleCancel}
          />
        ) : (
          <AdminUserTable
            onAdd={handleAdd}
            onEdit={handleEdit}
            showActions={true}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </PermissionWrapper>
  );
}

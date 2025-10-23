"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NewEhadTable } from "../../components/NewEhads/new-ehad-table";
import { NewEhadForm } from "../../components/NewEhads/new-ehad-form";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function NewEhadsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleAdd = () => {
    setShowForm(true);
  };

  const handleEdit = (newEhad: any) => {
    setEditData(newEhad);
    setShowEditForm(true);
  };

  const handleView = (newEhad: any) => {
    // Store new ehad data in sessionStorage as fallback
    if (typeof window !== "undefined") {
      sessionStorage.setItem("viewNewEhadData", JSON.stringify(newEhad));
    }
    router.push(`/new-ehads/${newEhad.id}`);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setShowEditForm(false);
    setEditData(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowEditForm(false);
    setEditData(null);
  };

  if (showForm) {
    return <NewEhadForm onSuccess={handleSuccess} onCancel={handleCancel} />;
  }

  if (showEditForm) {
    return (
      <NewEhadForm
        editData={editData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_NEW_EHADS}>
      <div className="container mx-auto px-4 py-8">
        <NewEhadTable
          onEdit={handleEdit}
          onAdd={handleAdd}
          onView={handleView}
        />
      </div>
    </PermissionWrapper>
  );
}

"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import RoleForm from "../../../components/Roles/role-form";
import { Role } from "@/types/Role";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function RoleFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setEditData(null);
      setLoading(false);
    } else {
      const sessionData = sessionStorage.getItem("editRole");
      if (sessionData) {
        const role = JSON.parse(sessionData);
        setEditData(role);
      }
      setLoading(false);
    }
  }, [id]);

  const handleCancel = () => {
    sessionStorage.removeItem("editRole");
    router.push("/roles");
  };

  const handleSuccess = () => {
    sessionStorage.removeItem("editRole");
    router.push("/roles");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-[rgb(153,153,153)] bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

  // Determine required permission based on action
  const requiredPermission = editData
    ? PERMISSIONS.EDIT_ROLES
    : PERMISSIONS.CREATE_ROLES;

  return (
    <PermissionWrapper requiredPermission={requiredPermission}>
      <div className="container mx-auto px-4 py-8">
        <RoleForm
          role={editData || undefined}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>
    </PermissionWrapper>
  );
}

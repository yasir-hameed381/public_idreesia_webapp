"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { KarkunanTable } from "../../components/Karkuns/karkunan-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function KarkunanPage() {
  const router = useRouter();

  const handleAdd = () => {
    // Clear any existing session data before navigating
    sessionStorage.removeItem("editRow");
    router.push("/karkunan/new");
  };

  const handleEdit = (karkun: any) => {
    if (typeof window !== "undefined") {
      // Store the user data in sessionStorage
      sessionStorage.setItem("editRow", JSON.stringify(karkun));
      // Navigate to update page with user ID
      router.push(`/karkunan/${karkun.id}`);
    }
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_KARKUNAN}>
      <div className="container mx-auto px-4 py-8">
        <KarkunanTable onEdit={handleEdit} onAdd={handleAdd} />
      </div>
    </PermissionWrapper>
  );
}

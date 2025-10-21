"use client";
import React, { useState } from "react";
import { ZoneTable } from "../../components/zone/Zonetabel";
import { useRouter } from "next/navigation";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function ZonePage() {
  const [editData, setEditData] = useState<any>(null);
  const router = useRouter();

  const handleEdit = (data: any) => {
    router.push(`/zone/${data}`);
  };

  const handleFormCancel = () => {
    setEditData(null);
  };

  const handleAddNew = () => {
    router.push("/zone/new");
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_ZONES}>
      <ZoneTable
        onEdit={handleEdit}
        onAdd={handleAddNew}
        oncancel={handleFormCancel}
      />
    </PermissionWrapper>
  );
}

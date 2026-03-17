"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MehfilDirectoryTable } from "../../components/Mehfil-Directory/MehfilDirectory-tabel";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function MehfilDirectoryPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push("/mehfildirectary/new");
  };

  const handleEdit = (data: any) => {
    router.push(`/mehfildirectary/${data}`);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MEHFIL_DIRECTORY}>
      <div className="container mx-auto px-4 py-8">
        <MehfilDirectoryTable onEdit={handleEdit} onAdd={handleAdd} />
      </div>
    </PermissionWrapper>
  );
}

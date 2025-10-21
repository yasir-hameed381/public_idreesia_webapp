"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { EhadKarkunTable } from "../../components/ehadKarkun/EhadKarkun-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
// import { setSessionData } from '../../../../../utils/session';
export default function EhadKarkunPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push("/ehadKarkun/new");
  };

  const handleEdit = (karkun: any) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("editRow", JSON.stringify(karkun));
      router.push(`/ehadKarkun/update`);
    }
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_EHAD_KARKUN}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ehad Karkun</h1>
        </div>
        <EhadKarkunTable onEdit={handleEdit} onAdd={handleAdd} />
      </div>
    </PermissionWrapper>
  );
}

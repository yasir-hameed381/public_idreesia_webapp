"use client";
import { Card } from "primereact/card";
import { MehfilTable } from "../../components/Mehfil/mehfil-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function MehfilPage() {
  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MEHFILS}>
      <div className="container mx-auto py-10">
        <MehfilTable />
      </div>
    </PermissionWrapper>
  );
}

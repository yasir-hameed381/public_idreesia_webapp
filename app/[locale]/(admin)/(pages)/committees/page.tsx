"use client";

import { useRouter, useParams } from "next/navigation";
import { CommitteeTable } from "../../components/Committees/committee-table";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function CommitteesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const handleAdd = () => {
    router.push(`/${locale}/committees/new`);
  };

  const handleEdit = (id: number | string) => {
    router.push(`/${locale}/committees/${id}`);
  };

  const handleManageMembers = (id: number | string) => {
    router.push(`/${locale}/committees/${id}/members`);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_COMMITTEES}>
      <div className="container mx-auto px-4 py-8">
        <CommitteeTable
          onEdit={handleEdit}
          onAdd={handleAdd}
          onManageMembers={handleManageMembers}
        />
      </div>
    </PermissionWrapper>
  );
}

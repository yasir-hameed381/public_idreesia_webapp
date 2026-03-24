"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommitteeForm } from "../../../components/Committees/committee-form";
import { useGetCommitteeByIdQuery } from "../../../../../../store/slicers/committeesApi";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import type { Committee } from "@/types/committee";

export default function CommitteeFormPage() {
  const params = useParams<{ id: string; locale?: string }>();
  const id = params?.id;
  const locale = params?.locale || "en";
  const router = useRouter();
  const [editData, setEditData] = useState<Committee | null | undefined>(undefined);

  const isNew = id === "new";
  const { data, isLoading, isError } = useGetCommitteeByIdQuery(id!, {
    skip: !id || isNew,
  });

  useEffect(() => {
    if (isNew) {
      setEditData(null);
      return;
    }
    if (data?.data) {
      setEditData(data.data as Committee);
    } else if (data === undefined && !isLoading && !isError) {
      setEditData(null);
    }
  }, [data, isNew, isLoading, isError]);

  const handleCancel = () => {
    router.push(`/${locale}/committees`);
  };

  const canCreate = PERMISSIONS.CREATE_COMMITTEES;
  const canEdit = PERMISSIONS.EDIT_COMMITTEES;

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isNew && (isError || (data && !(data as { data?: unknown }).data))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-red-500">Committee not found.</p>
          <button
            onClick={() => router.push(`/${locale}/committees`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Committees
          </button>
        </div>
      </div>
    );
  }

  const resolvedEditData = isNew ? null : (data?.data ?? editData ?? null);

  return (
    <PermissionWrapper
      requiredPermission={isNew ? canCreate : canEdit}
    >
      <CommitteeForm editData={resolvedEditData} onCancel={handleCancel} />
    </PermissionWrapper>
  );
}

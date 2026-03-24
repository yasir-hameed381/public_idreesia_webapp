"use client";

import { useParams, useRouter } from "next/navigation";
import { CommitteeMembers } from "../../../../components/Committees/committee-members";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import { useGetCommitteeByIdQuery } from "../../../../../../../store/slicers/committeesApi";

export default function CommitteeMembersPage() {
  const params = useParams<{ id: string; locale?: string }>();
  const router = useRouter();
  const id = params?.id;
  const locale = params?.locale || "en";

  const { data } = useGetCommitteeByIdQuery(id!, { skip: !id });
  const committeeName = (data?.data as { name?: string } | undefined)?.name;

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.MANAGE_COMMITTEE_MEMBERS}>
      <CommitteeMembers
        committeeId={id || ""}
        committeeName={committeeName}
        onBack={() => router.push(`/${locale}/committees`)}
      />
    </PermissionWrapper>
  );
}


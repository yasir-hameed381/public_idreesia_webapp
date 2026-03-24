"use client";

import { useFetchCommitteePortalContextQuery } from "@/store/slicers/committeesApi";
import { CommitteeMembers } from "../../../(admin)/components/Committees/committee-members";
import { useParams, useRouter } from "next/navigation";

export default function CommitteePortalMembersPage() {
  const { data, isLoading } = useFetchCommitteePortalContextQuery();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
        Loading members...
      </div>
    );
  }

  const selected = data?.selected_committee;
  if (!selected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
        No committee selected.
      </div>
    );
  }

  return (
    <CommitteeMembers
      committeeId={selected.committee_id}
      committeeName={selected.committee.name}
      onBack={() => router.push(`/${locale}/committee-portal/dashboard`)}
    />
  );
}


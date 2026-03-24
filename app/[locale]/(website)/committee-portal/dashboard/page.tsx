"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchCommitteePortalDashboardQuery } from "@/store/slicers/committeesApi";

export default function CommitteePortalDashboardPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const { data, isLoading } = useFetchCommitteePortalDashboardQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (!data?.has_access) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-600">
        No committee dashboard available.
      </div>
    );
  }

  const stats = data.stats || {
    members: 0,
    messages: 0,
    documents: 0,
    meetings: 0,
    active_polls: 0,
  };

  const cards = [
    { label: "Members", value: stats.members, href: `/${locale}/committee-portal/members` },
    { label: "Messages", value: stats.messages, href: `/${locale}/committee-portal/inbox` },
    { label: "Documents", value: stats.documents, href: `/${locale}/committee-portal/documents` },
    { label: "Meetings", value: stats.meetings, href: `/${locale}/committee-portal/meetings` },
    { label: "Active Polls", value: stats.active_polls, href: `/${locale}/committee-portal/polls` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Dashboard</h2>
        {data.committee && (
          <p className="inline-flex text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1 mt-2">
            {data.committee.parent_name
              ? `Sub committee of ${data.committee.parent_name}`
              : data.committee.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => router.push(card.href)}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-left hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
          >
            <div className="text-3xl font-semibold text-gray-900 leading-none">{card.value}</div>
            <div className="text-sm text-gray-500 mt-2">{card.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2">About Committee</h3>
        <p className="text-gray-700">{data.committee?.description || "No description available."}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm min-h-[140px]">
          <h3 className="font-semibold text-gray-900 mb-2">Recent Meetings</h3>
          <p className="text-sm text-gray-500">No meetings yet.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm min-h-[140px]">
          <h3 className="font-semibold text-gray-900 mb-2">Active Polls</h3>
          <p className="text-sm text-gray-500">No active polls.</p>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchCommitteePortalDashboardQuery } from "@/store/slicers/committeesApi";
import { useTranslations } from "next-intl";
import { Users, Mail, FileText, CalendarDays, BarChart3 } from "lucide-react";

export default function CommitteePortalDashboardPage() {
  const t = useTranslations("committeePortal");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const { data, isLoading } = useFetchCommitteePortalDashboardQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-600">
        {t("common.loading")}
      </div>
    );
  }

  if (!data?.has_access) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-600">
        {t("dashboardPage.noDashboard")}
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
    {
      label: t("common.members"),
      value: stats.members,
      href: `/${locale}/committee-portal/members`,
      icon: Users,
      iconWrapClass: "bg-blue-100 text-blue-600",
    },
    {
      label: t("dashboardPage.messages"),
      value: stats.messages,
      href: `/${locale}/committee-portal/inbox`,
      icon: Mail,
      iconWrapClass: "bg-green-100 text-green-600",
    },
    {
      label: t("common.documents"),
      value: stats.documents,
      href: `/${locale}/committee-portal/documents`,
      icon: FileText,
      iconWrapClass: "bg-amber-100 text-amber-700",
    },
    {
      label: t("common.meetings"),
      value: stats.meetings,
      href: `/${locale}/committee-portal/meetings`,
      icon: CalendarDays,
      iconWrapClass: "bg-purple-100 text-purple-700",
    },
    {
      label: t("dashboardPage.activePolls"),
      value: stats.active_polls,
      href: `/${locale}/committee-portal/polls`,
      icon: BarChart3,
      iconWrapClass: "bg-pink-100 text-pink-600",
    },
  ];
  const recentMeetings = data.recent_meetings || [];
  const activePolls = data.active_polls || [];

  const formatMeetingDate = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">{t("dashboardPage.title")}</h2>
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
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center ${card.iconWrapClass}`}>
                <card.icon size={18} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-900 leading-none">{card.value}</div>
                <div className="text-sm text-gray-500 mt-2">{card.label}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2">{t("dashboardPage.aboutCommittee")}</h3>
        <p className="text-gray-700">{data.committee?.description || t("dashboardPage.noDescription")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm min-h-[140px]">
          <h3 className="font-semibold text-gray-900 mb-2">{t("dashboardPage.recentMeetings")}</h3>
          {recentMeetings.length === 0 ? (
            <p className="text-sm text-gray-500">{t("dashboardPage.noMeetingsYet")}</p>
          ) : (
            <div className="space-y-4">
              {recentMeetings.map((meeting) => (
                <button
                  key={meeting.id}
                  type="button"
                  onClick={() => router.push(`/${locale}/committee-portal/meetings`)}
                  className="block w-full text-left rounded-md hover:bg-gray-50 px-2 py-1 -mx-2 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-medium text-gray-900 leading-tight">{meeting.title}</p>
                  <p className="text-sm text-gray-500">{formatMeetingDate(meeting.meeting_date)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm min-h-[140px]">
          <h3 className="font-semibold text-gray-900 mb-2">{t("dashboardPage.activePolls")}</h3>
          {activePolls.length === 0 ? (
            <p className="text-sm text-gray-500">{t("dashboardPage.noActivePolls")}</p>
          ) : (
            <div className="space-y-4">
              {activePolls.map((poll) => (
                <button
                  key={poll.id}
                  type="button"
                  onClick={() => router.push(`/${locale}/committee-portal/polls/${poll.hash_id}`)}
                  className="block w-full text-left rounded-md hover:bg-gray-50 px-2 py-1 -mx-2 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-medium text-gray-900 leading-tight">{poll.question}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


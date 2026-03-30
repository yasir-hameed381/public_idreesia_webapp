"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDeleteCommitteePortalMeetingMutation, useFetchCommitteePortalMeetingsQuery } from "@/store/slicers/committeesApi";
import { Ellipsis, Eye, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function CommitteePortalMeetingsPage() {
  const t = useTranslations("committeePortal");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const { showError, showSuccess } = useToast();
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteCommitteePortalMeetingMutation();
  const { data, isLoading } = useFetchCommitteePortalMeetingsQuery({
    page: 1,
    size,
    search,
  });

  const meetings = data?.data || [];
  const totalMeetings = data?.meta?.total || meetings.length;

  const formatMeetingDate = (value: string | null) => {
    if (!value) return { dayLine: "-", weekLine: "" };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { dayLine: "-", weekLine: "" };
    return {
      dayLine: date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      weekLine: date.toLocaleDateString(locale, {
        weekday: "long",
      }),
    };
  };

  const actionItems = [
    { key: "view", label: "View", icon: Eye },
    { key: "attendance", label: "Attendance", icon: ClipboardList },
    { key: "edit", label: "Edit", icon: Pencil },
    { key: "delete", label: "Delete", icon: Trash2 },
  ] as const;

  const handleMeetingAction = (actionKey: (typeof actionItems)[number]["key"], meetingId: number, meetingHashId?: string | null) => {
    setOpenMenuId(null);
    const routeId = meetingHashId || String(meetingId);
    if (actionKey === "view") {
      router.push(`/${locale}/committee-portal/meetings/${routeId}`);
      return;
    }
    if (actionKey === "edit") {
      router.push(`/${locale}/committee-portal/meetings/form?id=${meetingId}`);
      return;
    }
    if (actionKey === "attendance") {
      router.push(`/${locale}/committee-portal/meetings/${routeId}/attendance`);
      return;
    }
    if (actionKey === "delete") {
      const ok = window.confirm("Are you sure you want to delete this meeting?");
      if (!ok) return;
      deleteMeeting(meetingId)
        .unwrap()
        .then(() => showSuccess("Meeting deleted successfully."))
        .catch((error) => {
          const message = (error as { data?: { message?: string } })?.data?.message || "Failed to delete meeting.";
          showError(message);
        });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t("meetingsPage.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t("meetingsPage.subtitle")} ({totalMeetings})
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/meetings/form`)}
          className="shrink-0 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          {t("meetingsPage.scheduleMeeting")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("meetingsPage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("meetingsPage.tableDate")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("meetingsPage.tableTitle")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("meetingsPage.tableAttendance")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t("meetingsPage.tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {t("common.loading")}
                </td>
              </tr>
            ) : meetings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  {t("meetingsPage.noMeetings")}
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => {
                const dateLines = formatMeetingDate(meeting.meeting_date);
                return (
                  <tr key={meeting.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="font-medium">{dateLines.dayLine}</div>
                      {dateLines.weekLine ? <div className="text-gray-500">{dateLines.weekLine}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="font-medium text-gray-900">{meeting.title}</div>
                      {meeting.description ? <div className="text-gray-500 line-clamp-1">{meeting.description}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-gray-700">
                        {meeting.attendance || 0} recorded
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md px-2 py-1 hover:bg-gray-100 text-gray-700"
                          onClick={() => setOpenMenuId((prev) => (prev === meeting.id ? null : meeting.id))}
                        >
                          <Ellipsis size={16} />
                        </button>
                        {openMenuId === meeting.id ? (
                          <div className="absolute right-0 mt-1 z-20 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                            {actionItems.map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleMeetingAction(item.key, meeting.id, meeting.hash_id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                              >
                                <item.icon size={14} />
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}


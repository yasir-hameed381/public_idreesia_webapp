"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Pencil } from "lucide-react";
import { useFetchCommitteePortalMeetingAttendanceQuery, useFetchCommitteePortalMeetingByIdQuery } from "@/store/slicers/committeesApi";

export default function CommitteePortalMeetingViewPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string; id?: string }>();
  const locale = params?.locale || "en";
  const meetingId = useMemo(() => String(params?.id || "").trim(), [params?.id]);

  const { data: meetingData, isLoading: isMeetingLoading } = useFetchCommitteePortalMeetingByIdQuery(meetingId, {
    skip: !meetingId,
  });
  const { data: attendanceData, isLoading: isAttendanceLoading } = useFetchCommitteePortalMeetingAttendanceQuery(meetingId, {
    skip: !meetingId,
  });

  const title = meetingData?.data?.title || attendanceData?.meeting?.title || "Meeting";
  const meetingDateRaw = meetingData?.data?.meeting_date || attendanceData?.meeting?.meeting_date || null;
  const meetingDate = meetingDateRaw ? new Date(meetingDateRaw) : null;
  const formattedDate = meetingDate && !Number.isNaN(meetingDate.getTime())
    ? `${meetingDate.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })} - ${meetingDate.toLocaleDateString(locale, { weekday: "long" })}`
    : "-";

  const description = meetingData?.data?.description || "";
  const [agenda, masaweat] = description.split("\n");

  const summary = attendanceData?.summary || { total_members: 0, present: 0, absent: 0, excused: 0 };
  const members = attendanceData?.data || [];

  if (!meetingId) {
    return <div className="bg-white rounded-lg border p-8 text-center text-gray-600">Invalid meeting.</div>;
  }

  if (isMeetingLoading || isAttendanceLoading) {
    return <div className="bg-white rounded-lg border p-8 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/meetings/${meetingId}/attendance`)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ClipboardList size={14} />
            Attendance
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/meetings/form?id=${meetingData?.data?.id || ""}`)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/meetings`)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Agenda</h3>
            <p className="text-gray-700">{agenda || "-"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Masawaat (Decisions/Resolutions)</h3>
            <p className="text-gray-700">{masaweat || "-"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-2xl font-medium text-gray-900 mb-4">Attendance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Total Members</span><span className="px-2 py-0.5 rounded bg-gray-100">{summary.total_members}</span></div>
            <div className="flex items-center justify-between"><span>Present</span><span className="px-2 py-0.5 rounded bg-green-100 text-green-700">{summary.present}</span></div>
            <div className="flex items-center justify-between"><span>Absent</span><span className="px-2 py-0.5 rounded bg-red-100 text-red-700">{summary.absent}</span></div>
            <div className="flex items-center justify-between"><span>Excused</span><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">{summary.excused}</span></div>
          </div>

          <div className="my-4 border-t" />
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between text-sm">
                <span className="text-gray-800">{member.name}</span>
                <span className={`px-2 py-0.5 rounded ${
                  member.status === "present"
                    ? "bg-green-100 text-green-700"
                    : member.status === "excused"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {member.status === "present" ? "Present" : member.status === "excused" ? "Excused" : "Absent"}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/meetings/${meetingId}/attendance`)}
            className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Manage Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

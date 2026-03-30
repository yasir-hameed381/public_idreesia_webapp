"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  useFetchCommitteePortalMeetingAttendanceQuery,
  useSaveCommitteePortalMeetingAttendanceMutation,
} from "@/store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";

type StatusType = "present" | "absent" | "excused";

export default function CommitteePortalMeetingAttendancePage() {
  const router = useRouter();
  const params = useParams<{ locale?: string; id?: string }>();
  const locale = params?.locale || "en";
  const meetingId = useMemo(() => String(params?.id || "").trim(), [params?.id]);
  const { showError, showSuccess } = useToast();

  const { data, isLoading } = useFetchCommitteePortalMeetingAttendanceQuery(meetingId, {
    skip: !meetingId,
  });
  const [saveAttendance, { isLoading: isSaving }] = useSaveCommitteePortalMeetingAttendanceMutation();
  const [rows, setRows] = useState<{ user_id: number; name: string; status: StatusType; note: string }[]>([]);

  useEffect(() => {
    if (!data?.data) return;
    setRows(data.data.map((item) => ({
      user_id: item.user_id,
      name: item.name,
      status: item.status,
      note: item.note || "",
    })));
  }, [data]);

  const handleSave = async () => {
    try {
      await saveAttendance({
        id: meetingId,
        attendance: rows.map((r) => ({
          user_id: r.user_id,
          status: r.status,
          note: r.note || "",
        })),
      }).unwrap();
      showSuccess("Attendance saved successfully.");
      router.push(`/${locale}/committee-portal/meetings/${meetingId}`);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message || "Failed to save attendance.";
      showError(message);
    }
  };

  const meetingTitle = data?.meeting?.title || "Meeting Attendance";
  const meetingDateRaw = data?.meeting?.meeting_date;
  const meetingDate = meetingDateRaw ? new Date(meetingDateRaw) : null;
  const subtitle = meetingDate && !Number.isNaN(meetingDate.getTime())
    ? `${meetingTitle} - ${meetingDate.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`
    : meetingTitle;

  if (!meetingId) {
    return <div className="bg-white rounded-lg border p-8 text-center text-gray-600">Invalid meeting.</div>;
  }

  if (isLoading) {
    return <div className="bg-white rounded-lg border p-8 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Meeting Attendance</h2>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/meetings/${meetingId}`)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Back to Meeting
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.user_id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto_160px] gap-3 items-center border border-gray-100 rounded-lg p-3">
              <div className="text-3xl font-medium text-gray-900">{row.name}</div>
              <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                {(["present", "absent", "excused"] as StatusType[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setRows((prev) => prev.map((x) => x.user_id === row.user_id ? { ...x, status } : x))}
                    className={`px-3 py-1.5 text-sm capitalize ${
                      row.status === status
                        ? status === "present"
                          ? "bg-green-500 text-white"
                          : status === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <input
                value={row.note}
                onChange={(e) => setRows((prev) => prev.map((x) => x.user_id === row.user_id ? { ...x, note: e.target.value } : x))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Note"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

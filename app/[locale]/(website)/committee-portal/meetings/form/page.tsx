"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AttachmentUploadField from "@/components/AttachmentUploadField";
import { useTranslations } from "next-intl";
import {
  useCreateCommitteePortalMeetingMutation,
  useFetchCommitteePortalMeetingByIdQuery,
  useUpdateCommitteePortalMeetingMutation,
} from "@/store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";

export default function CommitteePortalMeetingFormPage() {
  const t = useTranslations("committeePortal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const { showError, showSuccess } = useToast();

  const meetingIdParam = searchParams.get("id");
  const isViewMode = searchParams.get("view") === "1";
  const meetingId = useMemo(() => {
    if (!meetingIdParam) return null;
    const parsed = Number(meetingIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [meetingIdParam]);

  const [meetingDate, setMeetingDate] = useState("");
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [masaweat, setMasaweat] = useState("");
  const [createMeeting, { isLoading: isCreating }] = useCreateCommitteePortalMeetingMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateCommitteePortalMeetingMutation();
  const { data: meetingData, isLoading: isLoadingMeeting } = useFetchCommitteePortalMeetingByIdQuery(meetingId as number, {
    skip: !meetingId,
  });

  useEffect(() => {
    if (!meetingData?.data) return;
    const dateValue = meetingData.data.meeting_date ? new Date(meetingData.data.meeting_date) : null;
    const normalizedDate = dateValue && !Number.isNaN(dateValue.getTime())
      ? dateValue.toISOString().slice(0, 10)
      : "";
    setMeetingDate(normalizedDate);
    setTitle(meetingData.data.title || "");
    setAgenda(meetingData.data.description || "");
  }, [meetingData]);

  const isSubmitting = isCreating || isUpdating;
  const readOnly = isViewMode;

  const handleSubmit = async () => {
    if (readOnly) return;
    if (!title.trim()) {
      showError("Title is required.");
      return;
    }
    try {
      const descriptionPayload = [agenda.trim(), masaweat.trim()].filter(Boolean).join("\n");
      const payload = {
        title: title.trim(),
        description: descriptionPayload || null,
        meeting_date: meetingDate || null,
      };

      if (meetingId) {
        await updateMeeting({ id: meetingId, body: payload }).unwrap();
        showSuccess("Meeting updated successfully.");
      } else {
        await createMeeting(payload).unwrap();
        showSuccess("Meeting created successfully.");
      }
      router.push(`/${locale}/committee-portal/meetings`);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message || "Failed to save meeting.";
      showError(message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t("meetingsForm.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("meetingsForm.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/meetings`)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          {t("meetingsForm.backToMeetings")}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("meetingsForm.meetingDate")}</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              disabled={readOnly || isLoadingMeeting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("meetingsForm.titleField")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readOnly || isLoadingMeeting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("meetingsForm.agenda")}</label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={4}
            placeholder={t("meetingsForm.agendaPlaceholder")}
            disabled={readOnly || isLoadingMeeting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("meetingsForm.masawat")}</label>
          <textarea
            value={masaweat}
            onChange={(e) => setMasaweat(e.target.value)}
            rows={4}
            placeholder={t("meetingsForm.masawatPlaceholder")}
            disabled={readOnly || isLoadingMeeting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("meetingsForm.attachments")}</label>
          <AttachmentUploadField />
        </div>

        {!readOnly ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingMeeting}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-70"
            >
              {isSubmitting ? t("common.loading") : t("meetingsForm.submit")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

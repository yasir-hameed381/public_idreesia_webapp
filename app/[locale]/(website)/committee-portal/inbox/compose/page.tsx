"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useFetchCommitteePortalContextQuery } from "@/store/slicers/committeesApi";
import AttachmentUploadField from "@/components/AttachmentUploadField";

export default function CommitteePortalComposePage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [errors, setErrors] = useState<{
    subject?: string;
    recipients?: string;
    message?: string;
  }>({});

  const { data } = useFetchCommitteePortalContextQuery();
  const committees = data?.committees || [];

  const recipientOptions = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return committees;
    return committees.filter((item) =>
      item.committee.name.toLowerCase().includes(q)
    );
  }, [recipientSearch, committees]);

  const toggleRecipient = (committeeId: number) => {
    setErrors((prev) => ({ ...prev, recipients: undefined }));
    setSelectedRecipients((prev) =>
      prev.includes(committeeId)
        ? prev.filter((id) => id !== committeeId)
        : [...prev, committeeId]
    );
  };

  const validateForm = () => {
    const nextErrors: typeof errors = {};

    if (!subject.trim()) nextErrors.subject = "Subject is required.";
    if (!message.trim()) nextErrors.message = "Message is required.";
    if (selectedRecipients.length === 0) nextErrors.recipients = "Please select at least one recipient.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSend = () => {
    if (!validateForm()) return;
    // TODO: Hook real API integration
    router.push(`/${locale}/committee-portal/inbox`);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Compose Message</h2>
          <p className="text-sm text-gray-600 mt-1">
            Send a message to committees or admins
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/inbox`)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Back to Inbox
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm ${
              errors.subject ? "border-red-400 focus:border-red-500" : "border-gray-300"
            }`}
          />
          {errors.subject ? <p className="mt-1 text-xs text-red-600">{errors.subject}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients *</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedRecipients.map((id) => {
              const recipient = committees.find((c) => c.committee_id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
                >
                  {recipient?.committee.name || "Committee"}
                  <button type="button" onClick={() => toggleRecipient(id)}>
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowRecipientModal(true)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 ${
              errors.recipients ? "border-red-400 text-red-700" : "border-gray-300 text-gray-700"
            }`}
          >
            <Plus size={14} />
            Add Recipients
          </button>
          {errors.recipients ? <p className="mt-1 text-xs text-red-600">{errors.recipients}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            rows={7}
            className={`w-full rounded-md border px-3 py-2 text-sm ${
              errors.message ? "border-red-400 focus:border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
          <AttachmentUploadField />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={!subject.trim() || !message.trim() || selectedRecipients.length === 0}
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send Message
          </button>
        </div>
      </div>

      {showRecipientModal && (
        <div className="fixed inset-0 z-[1200] bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-xl">
            <div className="p-5 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Select Recipients</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select committees or admins to send the message to
                </p>
              </div>
              <button onClick={() => setShowRecipientModal(false)} className="text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search by name, phone, email, ID, or zone..."
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-auto">
                {recipientOptions.map((item) => {
                  const checked = selectedRecipients.includes(item.committee_id);
                  return (
                    <button
                      key={item.membership_id}
                      type="button"
                      onClick={() => toggleRecipient(item.committee_id)}
                      className={`w-full text-left rounded-md border px-3 py-3 text-sm ${
                        checked
                          ? "border-blue-300 bg-blue-50 text-blue-800"
                          : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {item.committee.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecipientModal(false)}
                className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

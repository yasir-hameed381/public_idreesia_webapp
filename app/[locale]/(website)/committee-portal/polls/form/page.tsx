"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import {
  useCreateCommitteePortalPollMutation,
  useFetchCommitteePortalPollByIdQuery,
  useUpdateCommitteePortalPollMutation,
} from "@/store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";

export default function CommitteePortalPollFormPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale = params?.locale || "en";
  const editId = searchParams.get("id");
  const { showError, showSuccess } = useToast();
  const isEdit = !!editId;
  const { data: pollDetail, isLoading: isLoadingPoll } = useFetchCommitteePortalPollByIdQuery(
    String(editId),
    { skip: !isEdit },
  );
  const [createPoll, { isLoading: isCreating }] = useCreateCommitteePortalPollMutation();
  const [updatePoll, { isLoading: isUpdating }] = useUpdateCommitteePortalPollMutation();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    const poll = pollDetail?.poll;
    if (!poll || !isEdit) return;
    setQuestion(poll.question || "");
    setDescription(poll.description || "");
    setOptions(poll.options?.map((o) => o.option) || ["", ""]);
    setExpiresAt(poll.expires_at ? poll.expires_at.slice(0, 16) : "");
    setIsActive(!!poll.is_active);
    setAllowMultiple(!!poll.allow_multiple);
  }, [pollDetail?.poll, isEdit]);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const removeOption = (index: number) => {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addOption = () => setOptions((prev) => [...prev, ""]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!question.trim()) nextErrors.question = "Question is required";
    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) nextErrors.options = "At least 2 options are required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        question: question.trim(),
        description: description.trim() || null,
        is_active: isActive,
        allow_multiple: allowMultiple,
        expires_at: expiresAt || null,
        options: options.map((o) => o.trim()).filter(Boolean),
      };
      if (isEdit && editId) {
        await updatePoll({ id: editId, body: payload }).unwrap();
        showSuccess("Poll updated successfully.");
      } else {
        await createPoll(payload).unwrap();
        showSuccess("Poll created successfully.");
      }
      router.push(`/${locale}/committee-portal/polls`);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to save poll.";
      showError(message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Edit Poll" : "Create Poll"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit ? "Update poll details" : "Create a new poll for voting"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/polls`)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Polls
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {isLoadingPoll ? (
          <p className="text-sm text-gray-600">Loading poll details...</p>
        ) : null}
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.question ? (
              <p className="text-xs text-red-600 mt-1">{errors.question}</p>
            ) : null}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Additional details about this poll..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div key={`option-${idx}`} className="flex items-center gap-2">
                  <input
                    value={option}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {errors.options ? (
              <p className="text-xs text-red-600 mt-1">{errors.options}</p>
            ) : null}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} />
              Add Option
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full md:w-80"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active (active polls can receive votes)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
              />
              Allow Multiple Choices
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update Poll" : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


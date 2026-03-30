"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Pencil } from "lucide-react";
import {
  useFetchCommitteePortalPollByIdQuery,
  useVoteCommitteePortalPollMutation,
} from "@/store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";

export default function CommitteePortalPollDetailsPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string; id?: string }>();
  const locale = params?.locale || "en";
  const pollId = params?.id || "";
  const { showError, showSuccess } = useToast();
  const { data, isLoading } = useFetchCommitteePortalPollByIdQuery(pollId);
  const [votePoll, { isLoading: isSubmittingVote }] = useVoteCommitteePortalPollMutation();
  const poll = data?.poll;
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const isAdmin = !!data?.is_admin;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-700">Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-700">{data?.message || "Poll not found."}</p>
      </div>
    );
  }

  const canVote = poll.can_vote;
  const showVoteForm = canVote && !poll.has_voted;
  const totalVotes = poll.total_votes;

  const onVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOptions.length === 0) return;
    try {
      await votePoll({ id: pollId, option_ids: selectedOptions }).unwrap();
      showSuccess("Your vote has been recorded.");
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to submit vote.";
      showError(message);
    }
  };

  const toggleOption = (optionId: number) => {
    if (!poll.allow_multiple) {
      setSelectedOptions([optionId]);
      return;
    }
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-2">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">{poll.question}</h2>
          <p className="text-sm text-gray-600 mt-1">{totalVotes} total votes</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => router.push(`/${locale}/committee-portal/polls/form?id=${poll.id}`)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/polls`)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {poll.description ? (
              <p className="text-gray-600 mb-6">{poll.description}</p>
            ) : null}

            {showVoteForm ? (
              <form onSubmit={onVote}>
                <div className="space-y-3 mb-6">
                  {poll.options.map((option) => {
                    const checked = selectedOptions.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          checked ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type={poll.allow_multiple ? "checkbox" : "radio"}
                          name="poll-option"
                          checked={checked}
                          onChange={() => toggleOption(option.id)}
                        />
                        <span className="text-gray-900">{option.option}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingVote}
                  className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  {isSubmittingVote ? "Submitting..." : "Submit Vote"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {poll.options.map((option) => {
                  const votedByUser = poll.user_selected_option_ids.includes(option.id);
                  return (
                    <div key={option.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-gray-900 ${votedByUser ? "font-medium" : ""} inline-flex items-center gap-1`}
                        >
                          {option.option}
                          {votedByUser ? <CheckCircle2 size={14} className="text-blue-600" /> : null}
                        </span>
                        <span className="text-sm text-gray-500">
                          {option.vote_count} ({option.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {!canVote && (
                  <div className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    {!poll.is_active ? "This poll has been closed." : "This poll has expired."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Poll Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-xs ${
                    canVote ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {canVote ? "Active" : "Closed"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Multiple Choices</span>
                <span>{poll.allow_multiple ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(poll.created_at).toLocaleDateString()}</span>
              </div>
              {poll.expires_at ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">Expires</span>
                  <span>{new Date(poll.expires_at).toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-gray-500">Created by</span>
                <span>{poll.created_by_name || "Committee Admin"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


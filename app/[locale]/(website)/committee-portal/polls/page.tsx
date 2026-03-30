"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, MoreVertical } from "lucide-react";
import {
  useDeleteCommitteePortalPollMutation,
  useFetchCommitteePortalContextQuery,
  useFetchCommitteePortalPollsQuery,
} from "@/store/slicers/committeesApi";
import { useToast } from "@/hooks/useToast";

export default function CommitteePortalPollsPage() {
  const [filter, setFilter] = useState<"active" | "closed" | "all">("active");
  const [loadingFilter, setLoadingFilter] = useState<"active" | "closed" | "all" | null>(null);
  const [search, setSearch] = useState("");
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const { data: contextData } = useFetchCommitteePortalContextQuery();
  const { data, isLoading, isFetching } = useFetchCommitteePortalPollsQuery({
    filter,
    search,
    page: 1,
    size: 20,
  });
  const [deletePoll, { isLoading: isDeleting }] = useDeleteCommitteePortalPollMutation();
  const isAdmin =
    !!data?.is_admin || contextData?.selected_committee?.role === "admin";
  const visiblePolls = data?.data || [];

  useEffect(() => {
    if (!isFetching) {
      setLoadingFilter(null);
    }
  }, [isFetching]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-2 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Polls</h2>
          <p className="text-sm text-gray-600 mt-1">Committee polls and voting</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => router.push(`/${locale}/committee-portal/polls/form`)}
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            Create Poll
          </button>
        )}
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          {(["active", "closed", "all"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === filter) return;
                setLoadingFilter(key);
                setFilter(key);
              }}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                filter === key
                  ? "bg-gray-100 border-gray-300 text-gray-900"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {loadingFilter === key && isFetching ? (
                <span className="inline-flex items-center justify-center min-w-[18px]">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                </span>
              ) : (
                key[0].toUpperCase() + key.slice(1)
              )}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500 border">
            Loading polls...
          </div>
        ) : visiblePolls.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500 border">
            No polls found.
          </div>
        ) : (
          visiblePolls.map((poll) => {
            const expiresAt = poll.expires_at ? new Date(poll.expires_at) : null;
            const isOpen = poll.is_active && (!expiresAt || expiresAt.getTime() > Date.now());
            return (
              <div key={poll.id} className="bg-white rounded-lg shadow-sm border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/${locale}/committee-portal/polls/${poll.id}`)}
                      className="font-medium text-gray-900 hover:text-blue-600 text-lg text-left"
                    >
                      {poll.question}
                    </button>
                    {poll.description ? (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{poll.description}</p>
                    ) : null}
                  </div>
                  {isAdmin && (
                    <div className="relative">
                      <button
                        type="button"
                      onClick={() =>
                        setOpenActionsFor((prev) =>
                          prev === String(poll.id) ? null : String(poll.id),
                        )
                      }
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openActionsFor === String(poll.id) && (
                        <div className="absolute right-0 mt-1 bg-white border rounded-md shadow z-20 min-w-[130px]">
                          <button
                            type="button"
                            onClick={() => router.push(`/${locale}/committee-portal/polls/form?id=${poll.hash_id}`)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={async () => {
                              try {
                                const ok = window.confirm("Are you sure you want to delete this poll?");
                                if (!ok) return;
                                await deletePoll(poll.hash_id).unwrap();
                                setOpenActionsFor(null);
                                showSuccess("Poll deleted successfully.");
                              } catch (error) {
                                const message =
                                  (error as { data?: { message?: string } })?.data?.message ||
                                  "Failed to delete poll.";
                                showError(message);
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs ${
                      isOpen
                        ? "bg-green-100 text-green-700"
                        : poll.is_active
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isOpen ? "Active" : poll.is_active ? "Expired" : "Closed"}
                  </span>
                  <span className="text-gray-500">{poll.total_votes} votes</span>
                  <span className="text-gray-500">{poll.options_count} options</span>
                </div>

                {poll.expires_at ? (
                  <div className="mt-2 text-xs text-gray-400">
                    {isOpen ? "Expires" : "Expired"}{" "}
                    {new Date(poll.expires_at).toLocaleString()}
                  </div>
                ) : null}

                <div className="mt-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/committee-portal/polls/${poll.hash_id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {isOpen && !poll.has_user_voted ? "Vote Now" : "View Results"} &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


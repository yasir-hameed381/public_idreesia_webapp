"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useGetFeedbackByIdQuery, useUpdateFeedbackMutation } from "@/store/slicers/feedbackApi";
import { useToast } from "@/hooks/useToast";
import { FEEDBACK_TYPES } from "@/types/feedback";
import { APP_TYPES } from "@/types/appType";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface FeedbackShowProps {
  feedbackId: number;
}

export function FeedbackShow({ feedbackId }: FeedbackShowProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const { isSuperAdmin, hasPermission } = usePermissions();
  const canEditFeedback = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_FEEDBACK);

  const {
    data: feedbackData,
    isLoading,
    isError,
    refetch,
  } = useGetFeedbackByIdQuery(feedbackId, {
    skip: !feedbackId || isNaN(feedbackId),
  });

  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();

  // Extract feedback from response
  const feedback = feedbackData && typeof feedbackData === 'object' && 'data' in feedbackData
    ? (feedbackData as { data: any }).data
    : (feedbackData as any);

  // Get type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-100 text-red-800";
      case "feature":
      case "feature_request":
        return "bg-blue-100 text-blue-800";
      case "improvement":
        return "bg-green-100 text-green-800";
      case "compliment":
        return "bg-green-100 text-green-800";
      case "question":
        return "bg-yellow-100 text-yellow-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const feedbackType = FEEDBACK_TYPES.find((t) => t.value === type);
    return feedbackType?.label || type || "General";
  };

  // Get app type label
  const getAppTypeLabel = (appType?: string) => {
    const appTypeOption = APP_TYPES.find((t) => t.value === appType) || APP_TYPES[0];
    return appTypeOption.label;
  };

  // Handle toggle resolved
  const handleToggleResolved = async () => {
    if (!canEditFeedback) {
      showError("You don't have permission to edit feedback.");
      return;
    }

    if (!feedback) return;

    const newResolvedStatus = !feedback.is_resolved;

    try {
      await updateFeedback({
        id: feedback.id,
        name: feedback.name,
        contact_no: feedback.contact_no,
        type: feedback.type,
        app_type: feedback.app_type,
        subject: feedback.subject,
        description: feedback.description,
        screenshot: feedback.screenshot,
        is_resolved: newResolvedStatus,
      }).unwrap();

      // Show toast message based on the new status
      showSuccess(
        newResolvedStatus
          ? "Feedback marked as resolved."
          : "Feedback marked as pending."
      );
      
      // Refetch to update the UI
      refetch();
    } catch (error: any) {
      showError(error?.data?.message || "Failed to update feedback status.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Feedback not found
            </div>
            <p className="text-gray-600 mt-2">
              The feedback you are looking for does not exist.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Back to Feedbacks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isResolved = feedback.is_resolved || false;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Feedback Details
              </h1>
              <p className="text-gray-600 mt-1">
                View detailed feedback information
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleResolved}
                disabled={isUpdating || !canEditFeedback}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isResolved
                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isResolved ? (
                  <>
                    <XCircle size={16} />
                    Mark as Pending
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Mark as Resolved
                  </>
                )}
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Feedbacks
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Information Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6">
            {/* ID and Submitted At */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">ID</h3>
                <p className="text-base font-medium text-gray-900">
                  #{feedback.id}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Submitted At
                </h3>
                <p className="text-base font-medium text-gray-900">
                  {format(
                    new Date(feedback.created_at),
                    "dd MMM yyyy - hh:mm a"
                  )}
                </p>
              </div>
            </div>

            {/* Name and Contact Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Name
                </h3>
                <p className="text-base font-medium text-gray-900">
                  {feedback.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contact Number
                </h3>
                <p className="text-base font-medium text-gray-900">
                  {feedback.contact_no || "-"}
                </p>
              </div>
            </div>

            {/* Type, App Type, and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Type
                </h3>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                      feedback.type
                    )}`}
                  >
                    {getTypeLabel(feedback.type)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  App Type
                </h3>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                    {getAppTypeLabel(feedback.app_type)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Status
                </h3>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isResolved
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isResolved ? "Resolved" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Subject
              </h3>
              <p className="text-base font-medium text-gray-900">
                {feedback.subject || "-"}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {feedback.description || "-"}
                </p>
              </div>
            </div>

            {/* Screenshot */}
            {feedback.screenshot && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Screenshot
                </h3>
                <div className="mt-2">
                  <a
                    href={feedback.screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={feedback.screenshot}
                      alt="Feedback Screenshot"
                      className="max-w-full h-auto max-h-96 rounded-md border border-gray-200"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


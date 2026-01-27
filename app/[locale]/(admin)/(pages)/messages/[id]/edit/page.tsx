"use client";

import { useParams } from "next/navigation";
import { MessagesForm } from "@/app/[locale]/(admin)/components/Messages/messages-form";
import { useGetMessageByIdQuery } from "@/store/slicers/messagesApi";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import LoadingBar from "@/components/LoadingBar";

export default function EditMessagePage() {
  const params = useParams();
  const messageId = params.id as string;

  const {
    data: messageData,
    isLoading,
    isError,
  } = useGetMessageByIdQuery(Number(messageId), {
    skip: !messageId || isNaN(Number(messageId)),
  });

  const handleClose = () => {
    window.history.back();
  };

  const handleSuccess = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MESSAGES}>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </PermissionWrapper>
    );
  }

  if (isError || !messageData) {
    return (
      <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MESSAGES}>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-red-500 text-lg font-medium">
                Message not found
              </div>
              <p className="text-gray-600 mt-2">
                The message you are looking for does not exist.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Back to Messages
              </button>
            </div>
          </div>
        </div>
      </PermissionWrapper>
    );
  }

  // Extract message from response
  const message = messageData && typeof messageData === 'object' && 'data' in messageData
    ? (messageData as { data: any }).data
    : (messageData as any);

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_MESSAGES}>
      <MessagesForm
        onClose={handleClose}
        initialData={message}
        onSuccess={handleSuccess}
      />
    </PermissionWrapper>
  );
}


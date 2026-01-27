"use client";

import { useParams } from "next/navigation";
import { ScheduleMessageForm } from "@/app/[locale]/(admin)/components/Messages/schedule-message-form";

export default function EditScheduleMessagePage() {
  const params = useParams();
  const messageId = params.messageId as string;
  const scheduleId = params.scheduleId as string;

  if (!messageId || !scheduleId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Message ID or Schedule ID not found
            </div>
            <p className="text-gray-600 mt-2">
              Please check the URL and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ScheduleMessageForm messageId={messageId} scheduleId={scheduleId} />;
}


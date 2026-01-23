"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { useGetMessageByIdQuery } from "@/store/slicers/messagesApi";
import { useCreateMessageScheduleMutation } from "@/store/slicers/messageSchedulesApi";

// Validation schema
const scheduleSchema = yup.object().shape({
  scheduled_date: yup
    .string()
    .required("Date is required")
    .test("future-date", "Date must be today or in the future", function (value) {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  scheduled_time: yup.string().required("Time is required"),
  repeat: yup
    .string()
    .required("Repeat option is required")
    .oneOf(["no-repeat", "daily", "weekly", "monthly", "yearly"], "Invalid repeat option"),
  is_active: yup.boolean(),
  send_to_mobile_devices: yup.boolean(),
  monday: yup.boolean(),
  tuesday: yup.boolean(),
  wednesday: yup.boolean(),
  thursday: yup.boolean(),
  friday: yup.boolean(),
  saturday: yup.boolean(),
  sunday: yup.boolean(),
});

type ScheduleFormData = yup.InferType<typeof scheduleSchema>;

interface ScheduleMessageFormProps {
  messageId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ScheduleMessageForm({
  messageId,
  onCancel,
  onSuccess,
}: ScheduleMessageFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { showError, showSuccess } = useToast();

  const canCreateMessages =
    isSuperAdmin || hasPermission(PERMISSIONS.CREATE_MESSAGES);

  // Fetch message details
  const {
    data: messageData,
    isLoading: isLoadingMessage,
    error: messageError,
  } = useGetMessageByIdQuery(Number(messageId), {
    skip: !messageId,
  });

  const [createSchedule, { isLoading: isCreatingSchedule }] = useCreateMessageScheduleMutation();

  // Extract message from response - handle different response structures
  // Backend returns: { message: "...", data: MessageData }
  // The transformResponse normalizes to { data: MessageData }
  const message = messageData && typeof messageData === 'object' && 'data' in messageData
    ? (messageData as { data: any }).data
    : (messageData as any);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ScheduleFormData>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      scheduled_date: "",
      scheduled_time: "",
      repeat: "no-repeat",
      is_active: true,
      send_to_mobile_devices: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  const repeatValue = watch("repeat");

  // Set default date/time when component mounts
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split("T")[0];
    const now = new Date();
    const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    reset({
      scheduled_date: defaultDate,
      scheduled_time: defaultTime,
      repeat: "no-repeat",
      is_active: true,
      send_to_mobile_devices: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    });
  }, [reset]);

  // Clear day checkboxes when repeat is not weekly
  useEffect(() => {
    if (repeatValue !== "weekly") {
      reset({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      });
    }
  }, [repeatValue, reset]);

  const onSubmit = async (data: ScheduleFormData) => {
    if (!canCreateMessages) {
      showError("You don't have permission to schedule messages.");
      return;
    }

    // Validate weekly repeat has at least one day selected
    if (data.repeat === "weekly") {
      const hasDaySelected =
        data.monday ||
        data.tuesday ||
        data.wednesday ||
        data.thursday ||
        data.friday ||
        data.saturday ||
        data.sunday;

      if (!hasDaySelected) {
        showError("Please select at least one day for weekly repeat.");
        return;
      }
    }

    try {
      // TODO: Implement API call to create/update message schedule
      // For now, we'll show a success message
      const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
      showSuccess(
        `Message "${message?.title_en || "Message"}" scheduled for ${scheduledDateTime.toLocaleString()}`
      );

      // Navigate back to messages table
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/admin/messages`);
      }
    } catch (error: any) {
      showError(error?.data?.message || "Failed to schedule message. Please try again.");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/${locale}/admin/messages`);
    }
  };

  if (isLoadingMessage) {
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

  if (messageError || !message || !messageData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Message not found
            </div>
            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  const repeatOptions = [
    { value: "no-repeat", label: "No Repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const days = [
    { name: "monday", label: "Monday" },
    { name: "tuesday", label: "Tuesday" },
    { name: "wednesday", label: "Wednesday" },
    { name: "thursday", label: "Thursday" },
    { name: "friday", label: "Friday" },
    { name: "saturday", label: "Saturday" },
    { name: "sunday", label: "Sunday" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Message</h1>
              <p className="text-gray-600 mt-1">
                Set up when and how often to send a message
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Messages
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Message Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <div className="text-gray-900">{message.title_en}</div>
                <div dir="rtl" className="text-right text-gray-900 mt-1">
                  {message.title_ur}
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Schedule Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <Controller
                    name="scheduled_date"
                    control={control}
                    render={({ field, fieldState }) => (
                      <input
                        {...field}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
                  />
                  {errors.scheduled_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.scheduled_date.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <Controller
                    name="scheduled_time"
                    control={control}
                    render={({ field, fieldState }) => (
                      <input
                        {...field}
                        type="time"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}
                  />
                  {errors.scheduled_time && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.scheduled_time.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Repeat Options */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat *
                </label>
                <Controller
                  name="repeat"
                  control={control}
                  render={({ field, fieldState }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldState.invalid ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {repeatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.repeat && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.repeat.message as string}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Choose how often this message should be sent.
                </p>
              </div>

              {/* Weekly Day Selection */}
              {repeatValue === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {days.map((day) => (
                      <Controller
                        key={day.name}
                        name={day.name as keyof ScheduleFormData}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value as boolean}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{day.label}</span>
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Select at least one day of the week for the message to be sent.
                  </p>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value as boolean}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Active</span>
                          <p className="text-xs text-gray-500">
                            Inactive schedules will not send messages.
                          </p>
                        </div>
                      </label>
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="send_to_mobile_devices"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value as boolean}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Send to Mobile Devices
                          </span>
                          <p className="text-xs text-gray-500">
                            Send a push notification to all mobile devices.
                          </p>
                        </div>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCreatingSchedule}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isSubmitting || isCreatingSchedule) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    Save Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import * as yup from "yup";
import type React from "react";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useGetCategoriesQuery } from "@/store/slicers/categoryApi";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import {
  useCreateMessageMutation,
  useUpdateMessageMutation,
} from "@/store/slicers/messagesApi";

// Updated schema to match the backend model exactly
const schema: any = yup.object().shape({
  title_en: yup.string().required("Please enter a title in English."),
  title_ur: yup.string().required("Please enter a title in Urdu."),
  description_en: yup.string(),
  description_ur: yup.string(),
  is_published: yup.boolean(),
  at_top: yup.boolean(),
  show_notice: yup.boolean(),
  send_notification: yup.boolean(),
  wazaif_id: yup.string(),
  link_1_id: yup.string(),
  link_1_category_id: yup.string(),
  link_2_id: yup.string(),
  link_2_category_id: yup.string(),
  link_3_id: yup.string(),
  link_3_category_id: yup.string(),
  link_4_id: yup.string(),
  link_4_category_id: yup.string(),
});

interface MessagesFormProps {
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

export function MessagesForm({
  onClose,
  initialData,
  onSuccess,
}: MessagesFormProps) {
  // State management
  const { showError, showSuccess } = useToast();

  // API calls
  const { data: categoryData } = useGetCategoriesQuery({
    page: 1,
    size: 100,
    search: "",
  });

  const { data: wazaifData } = useGetWazaifQuery({
    page: 1,
    size: 100,
    search: "",
  });

  const categoryOptions = (categoryData?.data || []).map((cat) => ({
    label: cat.title_en,
    value: cat.id.toString(),
  }));

  const wazaifOptions = (wazaifData?.data || []).map((wazaif) => ({
    label: wazaif.title_en,
    value: wazaif.id?.toString(),
  }));

  const { user } = usePermissions();
  const [createMessage] = useCreateMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();

  // Form configuration
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setValue,
    watch,
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      title_en: initialData?.title_en || "",
      title_ur: initialData?.title_ur || "",
      description_en: initialData?.description_en || "",
      description_ur: initialData?.description_ur || "",
      is_published: initialData ? initialData.is_published === 1 : false,
      at_top: initialData?.at_top === 1 || false,
      show_notice: initialData?.show_notice === 1 || false,
      send_notification: initialData?.send_notification === 1 || false,
      wazaif_id: initialData?.wazaif_id || "",
      link_1_id: initialData?.link_1_id || "",
      link_1_category_id: initialData?.link_1_category_id || "",
      link_2_id: initialData?.link_2_id || "",
      link_2_category_id: initialData?.link_2_category_id || "",
      link_3_id: initialData?.link_3_id || "",
      link_3_category_id: initialData?.link_3_category_id || "",
      link_4_id: initialData?.link_4_id || "",
      link_4_category_id: initialData?.link_4_category_id || "",
    },
  });

  // Update form when editing item changes
  useEffect(() => {
    if (initialData) {
      reset({
        title_en: initialData.title_en || "",
        title_ur: initialData.title_ur || "",
        description_en: initialData.description_en || "",
        description_ur: initialData.description_ur || "",
        is_published: initialData.is_published === 1,
        at_top: initialData.at_top === 1,
        show_notice: initialData.show_notice === 1,
        send_notification: initialData.send_notification === 1,
        wazaif_id: initialData.wazaif_id || "",
        link_1_id: initialData.link_1_id || "",
        link_1_category_id: initialData.link_1_category_id || "",
        link_2_id: initialData.link_2_id || "",
        link_2_category_id: initialData.link_2_category_id || "",
        link_3_id: initialData.link_3_id || "",
        link_3_category_id: initialData.link_3_category_id || "",
        link_4_id: initialData.link_4_id || "",
        link_4_category_id: initialData.link_4_category_id || "",
      });
    } else {
      // Reset form for new message
      reset({
        title_en: "",
        title_ur: "",
        description_en: "",
        description_ur: "",
        is_published: false,
        at_top: false,
        show_notice: false,
        send_notification: false,
        wazaif_id: "",
        link_1_id: "",
        link_1_category_id: "",
        link_2_id: "",
        link_2_category_id: "",
        link_3_id: "",
        link_3_category_id: "",
        link_4_id: "",
        link_4_category_id: "",
      });
    }
  }, [initialData, reset]);

  // Submit handler
  const handleFormSubmit: SubmitHandler<any> = async (formData) => {
    try {
      // Prepare payload that matches backend model exactly
      const itemData: any = {
        title_en: formData.title_en,
        title_ur: formData.title_ur,
        description_en: formData.description_en || null,
        description_ur: formData.description_ur || null,
        is_published: formData.is_published ? 1 : 0,
        at_top: formData.at_top ? 1 : 0,
        show_notice: formData.show_notice ? 1 : 0,
        send_notification: formData.send_notification ? 1 : 0,
        wazaif_id: formData.wazaif_id ? parseInt(formData.wazaif_id, 10) : null,
        link_1_id: formData.link_1_id ? parseInt(formData.link_1_id, 10) : null,
        link_1_category_id: formData.link_1_category_id
          ? parseInt(formData.link_1_category_id, 10)
          : null,
        link_2_id: formData.link_2_id ? parseInt(formData.link_2_id, 10) : null,
        link_2_category_id: formData.link_2_category_id
          ? parseInt(formData.link_2_category_id, 10)
          : null,
        link_3_id: formData.link_3_id ? parseInt(formData.link_3_id, 10) : null,
        link_3_category_id: formData.link_3_category_id
          ? parseInt(formData.link_3_category_id, 10)
          : null,
        link_4_id: formData.link_4_id ? parseInt(formData.link_4_id, 10) : null,
        link_4_category_id: formData.link_4_category_id
          ? parseInt(formData.link_4_category_id, 10)
          : null,
      };

      console.log("=== PAYLOAD BEING SENT ===");
      console.log("Form Data:", formData);
      console.log("Processed Payload:", itemData);

      if (initialData) {
        const updateMessageData = {
          ...itemData,
          updated_by: user?.id ? user.id.toString() : "",
        };
        await updateMessage({
          id: initialData.id,
          ...updateMessageData,
        }).unwrap();
        showSuccess("Message updated successfully!");
      } else {
        const addNewMessageData = {
          ...itemData,
          created_by: user?.id ? user.id.toString() : "",
        };
        await createMessage(addNewMessageData).unwrap();
        showSuccess("Message created successfully!");
      }

      // Call onSuccess callback to refresh the table
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(error?.data?.message || "Request failed please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {initialData ? "Edit Message" : "Create Message"}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData
                  ? "Edit message details"
                  : "Add a new message to the system"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Messages
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Toggle Switches Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Published
                    </label>
                    <Controller
                      name="is_published"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            field.value ? "bg-gray-900" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              field.value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Show at Top
                    </label>
                    <Controller
                      name="at_top"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            field.value ? "bg-gray-900" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              field.value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Send Notification to Mobile Device
                    </label>
                    <Controller
                      name="send_notification"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            field.value ? "bg-gray-900" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              field.value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Show as Notice
                    </label>
                    <Controller
                      name="show_notice"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            field.value ? "bg-gray-900" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              field.value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Content Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Message Content
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (English) *
                    </label>
                    <Controller
                      name="title_en"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter title in English"
                        />
                      )}
                    />
                    {errors.title_en && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title_en.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (English)
                    </label>
                    <Controller
                      name="description_en"
                      control={control}
                      render={({ field, fieldState }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter description in English"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Urdu Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Urdu) *
                    </label>
                    <Controller
                      name="title_ur"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter title in Urdu"
                        />
                      )}
                    />
                    {errors.title_ur && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title_ur.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Urdu)
                    </label>
                    <Controller
                      name="description_ur"
                      control={control}
                      render={({ field, fieldState }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter description in Urdu"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attach Wazaif Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Attach Wazaif
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Wazaif
                </label>
                <Controller
                  name="wazaif_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="relative">
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">None</option>
                        {wazaifOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Links</h3>
              {[1, 2, 3, 4].map((linkNum) => (
                <div key={linkNum} className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">
                    Link {linkNum}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category ID
                      </label>
                      <Controller
                        name={`link_${linkNum}_category_id`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <div className="relative">
                            <select
                              {...field}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                                fieldState.invalid
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">None</option>
                              {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link ID
                      </label>
                      <Controller
                        name={`link_${linkNum}_id`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <input
                            {...field}
                            type="number"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              fieldState.invalid
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter link ID"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {initialData ? "Updating..." : "Creating..."}
                  </>
                ) : initialData ? (
                  "Update Message"
                ) : (
                  "Create Message"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import * as yup from "yup";
import React, { useState } from "react";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, ChevronDown, Upload, X } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import {
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
} from "@/store/slicers/feedbackApi";
import { FEEDBACK_TYPES } from "@/types/feedback";

// Updated schema to match the backend model exactly
const schema: any = yup.object().shape({
  name: yup.string().required("Please enter a name."),
  contact_no: yup.string().required("Please enter a contact number."),
  type: yup.string().required("Please select a feedback type."),
  subject: yup.string().required("Please enter a subject."),
  description: yup.string().required("Please enter a description."),
  screenshot: yup.string(),
});

interface FeedbackFormProps {
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

export function FeedbackForm({
  onClose,
  initialData,
  onSuccess,
}: FeedbackFormProps) {
  // State management
  const { showError, showSuccess } = useToast();
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );

  // API calls
  const { user } = usePermissions();
  const [createFeedback] = useCreateFeedbackMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();

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
      name: initialData?.name || "",
      contact_no: initialData?.contact_no || "",
      type: initialData?.type || "",
      subject: initialData?.subject || "",
      description: initialData?.description || "",
      screenshot: initialData?.screenshot || "",
    },
  });

  // Update form when editing item changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        contact_no: initialData.contact_no || "",
        type: initialData.type || "",
        subject: initialData.subject || "",
        description: initialData.description || "",
        screenshot: initialData.screenshot || "",
      });
      if (initialData.screenshot) {
        setScreenshotPreview(initialData.screenshot);
      }
    } else {
      // Reset form for new feedback
      reset({
        name: "",
        contact_no: "",
        type: "",
        subject: "",
        description: "",
        screenshot: "",
      });
      setScreenshotFile(null);
      setScreenshotPreview(null);
    }
  }, [initialData, reset]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove screenshot
  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setValue("screenshot", "");
  };

  // Upload file function
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/feedback/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("File upload error:", error);
      showError("Failed to upload screenshot. Please try again.");
      return null;
    }
  };

  // Submit handler
  const handleFormSubmit: SubmitHandler<any> = async (formData) => {
    try {
      let screenshotUrl = formData.screenshot || null;

      // If we have a new screenshot file, upload it first
      if (screenshotFile) {
        showSuccess("Uploading screenshot...");
        screenshotUrl = await uploadFile(screenshotFile);
        if (!screenshotUrl) {
          return; // Stop if upload failed
        }
      }

      // Prepare payload that matches backend model exactly
      const itemData: any = {
        name: formData.name,
        contact_no: formData.contact_no,
        type: formData.type,
        subject: formData.subject,
        description: formData.description,
        screenshot: screenshotUrl,
      };

      console.log("=== PAYLOAD BEING SENT ===");
      console.log("Form Data:", formData);
      console.log("Processed Payload:", itemData);

      if (initialData) {
        await updateFeedback({
          id: initialData.id,
          ...itemData,
        }).unwrap();
        showSuccess("Feedback updated successfully!");
      } else {
        await createFeedback(itemData).unwrap();
        showSuccess("Feedback created successfully!");
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
                {initialData ? "Edit Feedback" : "Create Feedback"}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData
                  ? "Edit feedback details"
                  : "Add a new feedback to the system"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Feedback
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <Controller
                      name="name"
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
                          placeholder="Enter name"
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <Controller
                      name="contact_no"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="tel"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter contact number"
                        />
                      )}
                    />
                    {errors.contact_no && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.contact_no.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Type *
                    </label>
                    <Controller
                      name="type"
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
                            <option value="">Select feedback type</option>
                            {FEEDBACK_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    />
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.type.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Content Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Feedback Content
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Controller
                    name="subject"
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
                        placeholder="Enter feedback subject"
                      />
                    )}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <textarea
                        {...field}
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter detailed description of the feedback"
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Screenshot Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Screenshot (Optional)
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Screenshot
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {screenshotPreview ? (
                      <div className="relative">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          className="mx-auto h-32 w-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="screenshot-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="screenshot-upload"
                              name="screenshot-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                  "Update Feedback"
                ) : (
                  "Create Feedback"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import * as yup from "yup";
import React, { useState } from "react";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from "@/store/slicers/tagsApi";
import type { Tag } from "@/app/types/tag";

// Updated schema to match the backend model exactly
const schema: any = yup.object().shape({
  name: yup.string().required("Please enter a tag name."),
  normalized: yup.string().required("Please enter a normalized name."),
});

interface TagFormProps {
  onClose: () => void;
  initialData?: Tag;
  onSuccess?: () => void;
}

export function TagForm({ onClose, initialData, onSuccess }: TagFormProps) {
  // State management
  const { showError, showSuccess } = useToast();

  // API calls
  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();

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
      normalized: initialData?.normalized || "",
    },
  });

  // Update form when editing item changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        normalized: initialData.normalized || "",
      });
    } else {
      // Reset form for new tag
      reset({
        name: "",
        normalized: "",
      });
    }
  }, [initialData, reset]);

  // Submit handler
  const handleFormSubmit: SubmitHandler<any> = async (formData) => {
    try {
      // Prepare payload that matches backend model exactly
      const itemData: any = {
        name: formData.name,
        normalized: formData.normalized,
      };

      console.log("=== PAYLOAD BEING SENT ===");
      console.log("Form Data:", formData);
      console.log("Processed Payload:", itemData);

      if (initialData?.tag_id) {
        await updateTag({
          tag_id: initialData.tag_id,
          data: itemData,
        }).unwrap();
        showSuccess("Tag updated successfully!");
      } else {
        await createTag(itemData).unwrap();
        showSuccess("Tag created successfully!");
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
                {initialData ? "Edit Tag" : "Create Tag"}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData
                  ? "Edit tag details"
                  : "Add a new tag to the system"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Tags
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Tag Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Name *
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
                          placeholder="Enter tag name"
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normalized Name *
                    </label>
                    <Controller
                      name="normalized"
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
                          placeholder="Enter normalized name"
                        />
                      )}
                    />
                    {errors.normalized && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.normalized.message as string}
                      </p>
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
                  "Update Tag"
                ) : (
                  "Create Tag"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

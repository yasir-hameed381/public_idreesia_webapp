"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Wazaif } from "../../../../types/wazif";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface WazaifFormProps {
  type?: string;
  customFieldLabels?: Record<string, string>;
  onCancel: () => void;
  onSubmit?: (data: any) => Promise<void>;
  onAddNewData?: (data: any) => Promise<any>;
  onUpdateData?: (data: any) => Promise<any>;
  editingItem?: Wazaif | null;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeImages = (images: string | string[] | undefined): string[] => {
  if (!images) return [];
  if (typeof images === "string") return [images];
  return images;
};

const WazaifForm: React.FC<WazaifFormProps> = ({
  type,
  customFieldLabels = {},
  onCancel,
  onSubmit,
  onAddNewData,
  onUpdateData,
  editingItem,
}) => {
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [formData, setFormData] = useState<any>({
    title_en: "",
    title_ur: "",
    description: "",
    images: [],
    slug: "",
    is_published: 1,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        images: normalizeImages(editingItem.images),
        is_published: editingItem.is_published || 1,
      });
    } else {
      setFormData({
        title_en: "",
        title_ur: "",
        description: "",
        images: [],
        slug: "",
        is_published: 1,
      });
    }
    setUploadedImages([]);
    setFileUploaded(false);
  }, [editingItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_WAZAIFS);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_WAZAIFS);
      
      if (editingItem && !canEdit) {
        showError("You don't have permission to edit wazaifs.");
        return;
      }
      
      if (!editingItem && !canCreate) {
        showError("You don't have permission to create wazaifs.");
        return;
      }

      if (!formData.title_en || !formData.title_ur || !formData.description) {
        showError("Please fill in all required fields");
        return;
      }

      const slug = generateSlug(formData.title_en);
      const normalizedImages = normalizeImages(formData.images);

      const payload = {
        title_en: formData.title_en,
        title_ur: formData.title_ur,
        description: formData.description,
        slug,
        is_published: formData.is_published,
        images: normalizedImages.length > 0 ? normalizedImages.join(",") : "",
      };

      // console.log("Wazaif payload being sent:", payload);

      if (editingItem) {
        const updateData = { ...payload, updated_by: 1 }; // Add user ID
        await onUpdateData?.(updateData);
        showSuccess("Wazaif updated successfully!");
      } else {
        const addData = { ...payload, created_by: 1 }; // Add user ID
        await onAddNewData?.(addData);
        showSuccess("Wazaif created successfully!");
      }

      if (onSubmit) {
        await onSubmit(payload);
      }

      onCancel();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error details:", error?.data || error?.message);
      showError(
        error?.data?.message || "Failed to save wazaif. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedImages((prev) => [...prev, ...fileNames]);
      setFormData((prev) => ({
        ...prev,
        images: normalizeImages(prev.images).concat(fileNames),
      }));
      setFileUploaded(true);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedImages((prev) => [...prev, ...fileNames]);
      setFormData((prev) => ({
        ...prev,
        images: normalizeImages(prev.images).concat(fileNames),
      }));
      setFileUploaded(true);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const currentImages = normalizeImages(prev.images);
      const updatedImages = [...currentImages];
      updatedImages.splice(index, 1);
      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {type || "Create Wazaif"}
              </h1>
              <p className="text-gray-600 mt-1">
                {editingItem
                  ? "Edit wazaif details"
                  : "Add a new Islamic supplication"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Wazaif
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Status Toggle */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <div className="flex items-center justify-start gap-4">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Published
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        is_published: prev.is_published === 1 ? 0 : 1,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_published === 1
                        ? "bg-gray-900"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_published === 1
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title in English"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Urdu) *
                  </label>
                  <input
                    type="text"
                    name="title_ur"
                    value={formData.title_ur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title in Urdu"
                    dir="rtl"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter description"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload images for this wazaif. Only JPG, PNG, and GIF files
                  are allowed.
                </p>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & Drop your images or{" "}
                    <label className="text-blue-600 cursor-pointer hover:text-blue-500">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  {normalizeImages(formData.images).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded images:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {normalizeImages(formData.images).map(
                          (image, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                            >
                              {image}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
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
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : editingItem ? (
                  "Update Wazaif"
                ) : (
                  "Create Wazaif"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WazaifForm;

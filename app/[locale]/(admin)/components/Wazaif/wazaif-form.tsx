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
    description_en: "",
    images: [],
    slug: "",
    is_published: 1,
    is_admin_favorite: 0,
    is_for_karkun: 0,
    is_for_ehad_karkun: 0,
    is_sticky: 0,
    wazaif_number: "",
    category: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { label: "Bunyadi Wazaif", value: "bunyadi" },
    { label: "Notice Bord Taleem", value: "notice_board_taleem" },
    { label: "Parhaiyan", value: "parhaiyan" },
    { label: "Wazaif", value: "wazaif" },
  ];

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        images: normalizeImages(editingItem.images),
        is_published: editingItem.is_published !== undefined ? (editingItem.is_published ? 1 : 0) : 1,
        is_admin_favorite: editingItem.is_admin_favorite ? 1 : 0,
        is_for_karkun: editingItem.is_for_karkun ? 1 : 0,
        is_for_ehad_karkun: editingItem.is_for_ehad_karkun ? 1 : 0,
        is_sticky: editingItem.is_sticky ? 1 : 0,
        category: editingItem.category || "",
        wazaif_number: editingItem.wazaif_number || "",
        description_en: editingItem.description_en || "",
      });
    } else {
      setFormData({
        title_en: "",
        title_ur: "",
        description: "",
        description_en: "",
        images: [],
        slug: "",
        is_published: 1,
        is_admin_favorite: 0,
        is_for_karkun: 0,
        is_for_ehad_karkun: 0,
        is_sticky: 0,
        wazaif_number: "",
        category: "",
      });
    }
    setUploadedImages([]);
    setFileUploaded(false);
  }, [editingItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name] === 1 ? 0 : 1,
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

      if (!formData.title_en || !formData.title_ur || !formData.category) {
        showError("Please fill in all required fields (Titles and Category)");
        return;
      }

      const slug = editingItem ? formData.slug : generateSlug(formData.title_en);
      const normalizedImages = normalizeImages(formData.images);

      const payload = {
        ...formData,
        slug,
        images: normalizedImages.length > 0 ? normalizedImages.join(",") : "",
      };

      if (editingItem) {
        const updateData = { ...payload, id: editingItem.id, updated_by: 1 };
        await onUpdateData?.(updateData);
        showSuccess("Wazaif updated successfully!");
      } else {
        const addData = { ...payload, created_by: 1 };
        await onAddNewData?.(addData);
        showSuccess("Wazaif created successfully!");
      }

      if (onSubmit) {
        await onSubmit(payload);
      }

      onCancel();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showError(
        error?.data?.message || "Failed to save wazaif. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /^image\/(jpeg|jpg|png|gif)$/i.test(f.type)
    );
    if (files.length === 0) return;
    const names = files.map((f) => f.name);
    setFormData((prev) => ({
      ...prev,
      images: [...normalizeImages(prev.images), ...names],
    }));
    setFileUploaded(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const valid = files.filter((f) =>
      /^image\/(jpeg|jpg|png|gif)$/i.test(f.type)
    );
    if (valid.length === 0) return;
    const names = valid.map((f) => f.name);
    setFormData((prev) => ({
      ...prev,
      images: [...normalizeImages(prev.images), ...names],
    }));
    setFileUploaded(true);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const current = normalizeImages(formData.images);
    const next = current.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: next }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {type || (editingItem ? "Edit Wazaif" : "Create Wazaif")}
              </h1>
              <p className="text-gray-600 mt-1">
                {editingItem
                  ? "Update wazaif details"
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
            {/* Status Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Published
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle("is_published")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_published === 1 ? "bg-gray-900" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_published === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    For Karkun Only
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle("is_for_karkun")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_for_karkun === 1 ? "bg-gray-900" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_for_karkun === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    For Ehad Karkuns
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle("is_for_ehad_karkun")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_for_ehad_karkun === 1 ? "bg-gray-900" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_for_ehad_karkun === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sticky
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle("is_sticky")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_sticky === 1 ? "bg-gray-900" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_sticky === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Favorite
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle("is_admin_favorite")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_admin_favorite === 1 ? "bg-gray-900" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_admin_favorite === 1 ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wazaif Number
                </label>
                <input
                  type="text"
                  name="wazaif_number"
                  value={formData.wazaif_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. W-001"
                />
              </div>

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

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    name="description_en"
                    value={formData.description_en}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter English description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Urdu)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter Urdu description"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Files (Images/PDFs)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload images for this wazaif. Only JPG, PNG, and GIF files
                  are allowed.
                </p>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
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

"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, FileImage } from "lucide-react";

interface TabarukatFormData {
  id?: number;
  name: string;
  description: string;
  co_name: string;
  phone_no: string;
  images: File[];
  mehfil_directory_id: string | number | null;
  zone_id: string | number | null;
}

interface TabarukatFormProps {
  editData?: TabarukatFormData | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function TabarukatForm({
  editData,
  onCancel,
  onSuccess,
}: TabarukatFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: "",
    search: "",
  });

  const ALL_ZONES = zonesData?.data || [];
  const ALL_MEHFILS = mehfilData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TabarukatFormData>({
    defaultValues: {
      images: [],
    },
  });

  const selectedZone = watch("zone_id");

  // Filter mehfils based on selected zone
  const filteredMehfils = selectedZone
    ? ALL_MEHFILS.filter(
        (mehfil: any) => mehfil.zone_id === parseInt(selectedZone.toString())
      )
    : ALL_MEHFILS;

  // Set form values when editData changes
  useEffect(() => {
    if (editData) {
      reset({
        id: editData.id,
        name: editData.name || "",
        description: editData.description || "",
        co_name: editData.co_name || "",
        phone_no: editData.phone_no || "",
        zone_id: editData.zone_id?.toString() || "",
        mehfil_directory_id: editData.mehfil_directory_id?.toString() || "",
      });
    }
  }, [editData, reset]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file types
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      if (!isValidType) {
        showError(`File ${file.name} is not a valid image or PDF file.`);
      }
      return isValidType;
    });

    // Check total file count
    if (uploadedFiles.length + validFiles.length > 5) {
      showError("Maximum 5 files allowed.");
      return;
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs for images
    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrls((prev) => [...prev, url]);
      }
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      setValue("images", newFiles);
      return newFiles;
    });

    // Remove corresponding preview URL if it exists
    if (index < previewUrls.length) {
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (formData: TabarukatFormData) => {
    try {
      setIsLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("co_name", formData.co_name);
      submitData.append("phone_no", formData.phone_no);
      submitData.append("zone_id", formData.zone_id?.toString() || "");
      submitData.append(
        "mehfil_directory_id",
        formData.mehfil_directory_id?.toString() || ""
      );

      // Append files
      uploadedFiles.forEach((file, index) => {
        submitData.append(`images`, file);
      });

      const url =
        editData && editData.id
          ? `/api/tabarukat/update/${editData.id}`
          : "/api/tabarukat/add";

      const method = editData && editData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save tabarukat");
      }

      showSuccess(
        editData
          ? "Tabarukat updated successfully!"
          : "Tabarukat created successfully!"
      );
      onSuccess();
    } catch (error: any) {
      console.error("Error saving tabarukat:", error);
      showError(error.message || "Failed to save tabarukat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Processing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft size={20} />
            Back to Tabarukats
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {editData ? "Edit Tabarukat" : "Create Tabarukat"}
          </h1>
          <p className="text-gray-600 mt-1">
            {editData ? "Update tabarukat information" : "Add a new tabarukat"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tabarukat name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* CO Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CO Name
                </label>
                <input
                  {...register("co_name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter coordinator name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register("phone_no")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone *
                </label>
                <select
                  {...register("zone_id", { required: "Zone is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {ALL_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
                {errors.zone_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.zone_id.message}
                  </p>
                )}
              </div>

              {/* Mehfil Directory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil Directory *
                </label>
                <select
                  {...register("mehfil_directory_id", {
                    required: "Mehfil Directory is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Mehfil Directory</option>
                  {filteredMehfils.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      {mehfil.address_en}
                    </option>
                  ))}
                </select>
                {errors.mehfil_directory_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mehfil_directory_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
              />
            </div>

            {/* File Upload Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload PDF documents or images for this tabarukat. Maximum 5
                files allowed. Only PDF and image files are allowed.
              </p>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Drag & Drop your files or{" "}
                  <span className="text-blue-600 hover:text-blue-500">
                    browse files
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative border rounded-lg p-2"
                      >
                        {file.type.startsWith("image/") ? (
                          <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {file.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {editData ? "Update Tabarukat" : "Create Tabarukat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


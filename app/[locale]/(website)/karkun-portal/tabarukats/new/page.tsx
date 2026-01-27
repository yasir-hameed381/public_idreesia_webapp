"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Upload, X, FileImage, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface Zone {
  id: number;
  title_en: string;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  uploadedUrl?: string;
  uploading?: boolean;
}

const NewTabarukatPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coName, setCoName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zoneId, setZoneId] = useState<number | null>(user?.zone_id || null);
  const [mehfilDirectoryId, setMehfilDirectoryId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );

  // Dropdown data
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load zones
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await apiClient.get("/admin/zones", {
          params: { per_page: 1000 },
        });
        setZones(response.data.data || []);
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };

    if (user) {
      loadZones();
    }
  }, [user]);

  // Load mehfils when zone changes
  useEffect(() => {
    const loadMehfils = async () => {
      if (!zoneId) {
        setMehfilDirectories([]);
        return;
      }

      try {
        const response = await apiClient.get("/mehfil-directory", {
          params: { zoneId: zoneId, size: 1000 },
        });
        const mehfils = (response.data.data || []).sort(
          (a: MehfilDirectory, b: MehfilDirectory) =>
            parseInt(a.mehfil_number) - parseInt(b.mehfil_number)
        );
        setMehfilDirectories(mehfils);
      } catch (error) {
        console.error("Error loading mehfils:", error);
      }
    };

    loadMehfils();
  }, [zoneId]);

  // Reset mehfil when zone changes
  useEffect(() => {
    if (zoneId !== user?.zone_id) {
      setMehfilDirectoryId(null);
    }
  }, [zoneId, user?.zone_id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate file types and count
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      if (!isValidType) {
        showError(
          `File ${file.name} is not a valid image or PDF file. Only .jpg, .jpeg, .png, .pdf are allowed.`
        );
      }
      return isValidType;
    });

    // Check total file count (max 5)
    if (uploadedFiles.length + validFiles.length > 5) {
      showError("Maximum 5 files allowed.");
      return;
    }

    // Check file size (max 20MB per file)
    const oversizedFiles = validFiles.filter((file) => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showError("File size must be less than 20MB.");
      return;
    }

    // Add files with preview URLs for images
    const newFiles: UploadedFile[] = validFiles.map((file) => {
      const uploadedFile: UploadedFile = { file };
      if (file.type.startsWith("image/")) {
        uploadedFile.preview = URL.createObjectURL(file);
      }
      return uploadedFile;
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "tabarukat");

    const response = await apiClient.post("/file-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.data.url || response.data.data.uploadURL;
    } else {
      throw new Error(response.data.message || "Failed to upload file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showError("Name is required");
      return;
    }

    if (!zoneId) {
      showError("Zone is required");
      return;
    }

    if (!mehfilDirectoryId) {
      showError("Mehfil Directory is required");
      return;
    }

    if (uploadedFiles.length === 0) {
      showError("At least one file is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all files first
      const imageUrls: string[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        
        // If already uploaded, use existing URL
        if (uploadedFile.uploadedUrl) {
          imageUrls.push(uploadedFile.uploadedUrl);
          continue;
        }

        // Mark as uploading
        setUploadedFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: true };
          return updated;
        });

        try {
          const url = await uploadFileToS3(uploadedFile.file);
          imageUrls.push(url);

          // Update file with uploaded URL
          setUploadedFiles((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], uploadedUrl: url, uploading: false };
            return updated;
          });
        } catch (error: any) {
          console.error(`Error uploading file ${uploadedFile.file.name}:`, error);
          showError(`Failed to upload ${uploadedFile.file.name}: ${error.message}`);
          
          // Mark as not uploading
          setUploadedFiles((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], uploading: false };
            return updated;
          });
          
          setIsSubmitting(false);
          return;
        }
      }

      // Create tabarukat with uploaded image URLs
      const response = await apiClient.post("/tabarukat/add", {
        name: name.trim(),
        description: description.trim() || null,
        co_name: coName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        zone_id: zoneId,
        mehfil_directory_id: mehfilDirectoryId,
        images: imageUrls,
        created_by: user?.id || null,
      });

      if (response.data.success) {
        showSuccess("Tabarukat created successfully");
        router.push("/karkun-portal/tabarukats");
      } else {
        showError(response.data.message || "Failed to create tabarukat");
      }
    } catch (error: any) {
      console.error("Error creating tabarukat:", error);
      showError(
        error.response?.data?.message ||
          "Failed to create tabarukat. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/karkun-portal/tabarukats"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Tabarukats
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Tabarukat</h1>
          <p className="text-gray-600 mt-1">Add a new tabarukat</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tabarukat name"
                  required
                />
              </div>

              {/* CO Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CO Name
                </label>
                <input
                  type="text"
                  value={coName}
                  onChange={(e) => setCoName(e.target.value)}
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
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={zoneId || ""}
                  onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mehfil Directory */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil Directory <span className="text-red-500">*</span>
                </label>
                <select
                  value={mehfilDirectoryId || ""}
                  onChange={(e) =>
                    setMehfilDirectoryId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={!zoneId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Mehfil Directory</option>
                  {mehfilDirectories.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en || mehfil.address_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
              />
            </div>

            {/* File Upload Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload PDF documents or images for this tabarukat. Maximum 5 files
                allowed. Only PDF and image files (.jpg, .jpeg, .png, .pdf) are
                allowed. Maximum file size: 20MB per file.
              </p>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Drag & Drop your files or{" "}
                  <span className="text-blue-600 hover:text-blue-500">
                    browse files
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {uploadedFiles.length} / 5 files selected
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length}):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="relative border rounded-lg p-2 bg-gray-50"
                      >
                        {uploadedFile.uploading ? (
                          <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                          </div>
                        ) : uploadedFile.file.type.startsWith("image/") &&
                          uploadedFile.preview ? (
                          <img
                            src={uploadedFile.preview}
                            alt={uploadedFile.file.name}
                            className="w-full aspect-square object-cover rounded"
                          />
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-1 truncate" title={uploadedFile.file.name}>
                          {uploadedFile.file.name}
                        </p>
                        {uploadedFile.uploadedUrl && (
                          <span className="text-xs text-green-600">✓ Uploaded</span>
                        )}
                        {!uploadedFile.uploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
            <Link
              href="/karkun-portal/tabarukats"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || uploadedFiles.length === 0}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Tabarukat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTabarukatPage;


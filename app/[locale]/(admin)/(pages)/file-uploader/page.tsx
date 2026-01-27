"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, CheckCircle } from "lucide-react";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface UploadedFile {
  originalName: string;
  uploadName: string;
  path: string;
  mimeType: string;
  extension: string;
  size: number;
  uploadURL: string;
  directory: string;
}

const FileUploaderPage = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { showError, showSuccess } = useToast();
  const { isSuperAdmin, hasPermission } = usePermissions();
  const canUploadFile = isSuperAdmin || hasPermission(PERMISSIONS.UPLOAD_FILE);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [directory, setDirectory] = useState("files");
  const [allowedFileTypes] = useState(".jpg, .jpeg, .png, .pdf, .doc, .docx, .xls, .xlsx, .mp4, .mov");
  const [maxFiles] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Validate file type
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = allowedFileTypes
      .split(",")
      .map((type) => type.trim().toLowerCase().replace(".", ""));
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    return allowedTypes.includes(fileExtension);
  };

  // Upload file to S3 via backend
  const uploadFileToS3 = async (file: File): Promise<UploadedFile | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", file.name);
      formData.append("contentType", file.type);

      // Use backend API endpoint for file upload
      const apiBaseUrl = getApiBaseUrl();
      const headers = new Headers();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      // Don't set Content-Type for FormData - browser will set it with boundary
      
      const response = await fetch(`${apiBaseUrl}/api/v1/file-upload/file-upload`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          originalName: file.name,
          uploadName: result.data.uploadName || file.name,
          path: result.data.path || result.data.key || "",
          mimeType: file.type,
          extension: file.name.split(".").pop() || "",
          size: file.size,
          uploadURL: result.data.url || result.data.uploadURL || "",
          directory: directory,
        };
      }

      throw new Error(result.message || "Upload failed");
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (!canUploadFile) {
      showError("You don't have permission to upload files.");
      return;
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter((file) => !isValidFileType(file));
    if (invalidFiles.length > 0) {
      showError(
        `Invalid file types. Allowed types: ${allowedFileTypes}`
      );
      return;
    }

    // Check max files
    if (selectedFiles.length > maxFiles) {
      showError(`Maximum ${maxFiles} file(s) allowed.`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = selectedFiles.map((file) =>
        uploadFileToS3(file)
      );
      const uploaded = await Promise.all(uploadPromises);

      const successfulUploads = uploaded.filter(
        (file): file is UploadedFile => file !== null
      );

      if (successfulUploads.length > 0) {
        setUploadedFiles(successfulUploads);
        showSuccess(
          `Successfully uploaded ${successfulUploads.length} file(s)!`
        );
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showError("Failed to upload files. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      showError(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setUploadedFiles([]);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleBackToAdmin = () => {
    router.push(`/${locale}/admin`);
  };

  if (!canUploadFile) {
    return (
      <PermissionWrapper requiredPermission={PERMISSIONS.UPLOAD_FILE}>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">You don't have permission to upload files.</p>
          </div>
        </div>
      </PermissionWrapper>
    );
  }

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.UPLOAD_FILE}>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                File Uploader
              </h1>
              <p className="text-gray-600">Upload files directly to S3 bucket</p>
            </div>
            <button
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              onClick={handleBackToAdmin}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Admin
            </button>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload File
              </h2>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 text-gray-400">
                    <Upload className="w-full h-full" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-600">
                      Drag & Drop your file or{" "}
                      <span className="text-blue-600 hover:text-blue-800 underline font-medium">
                        browse files
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Allowed types: {allowedFileTypes}
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple={maxFiles > 1}
                  onChange={handleFileSelect}
                  accept={allowedFileTypes}
                />
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Selected Files:
                  </h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-red-600 hover:text-red-800 p-1 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-6 flex justify-end gap-2">
                {uploadedFiles.length > 0 && (
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                    onClick={resetUploader}
                  >
                    Reset
                  </button>
                )}
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedFiles.length === 0 || isUploading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={selectedFiles.length === 0 || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </button>
              </div>
            </div>

            {/* Uploaded File Details */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Uploaded File Details
                </h3>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="space-y-2 mb-4 last:mb-0">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Original Name:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {file.originalName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        File Path:
                      </span>
                      <span className="text-sm text-gray-900 ml-2 break-all">
                        {file.path}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        File Type:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {file.mimeType}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        File Size:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    {file.uploadURL && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          File URL:
                        </span>
                        <a
                          href={file.uploadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all ml-2"
                        >
                          {file.uploadURL}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionWrapper>
  );
};

export default FileUploaderPage;

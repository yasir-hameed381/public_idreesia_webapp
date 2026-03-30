"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

const DEFAULT_ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

interface AttachmentUploadFieldProps {
  onValidFileChange?: (file: File | null) => void;
  allowedExtensions?: string[];
  simulateFailure?: boolean;
}

export default function AttachmentUploadField({
  onValidFileChange,
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  simulateFailure = true,
}: AttachmentUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadState, setUploadState] = useState<{
    name: string;
    sizeKb: number;
    status: "uploading" | "failed";
  } | null>(null);
  const [attachmentHint, setAttachmentHint] = useState("");
  const [showAttachmentHint, setShowAttachmentHint] = useState(false);
  const [showUploadToast, setShowUploadToast] = useState(false);

  const handleAttachmentChange = (file?: File | null) => {
    if (!file) {
      setFileName("");
      setUploadState(null);
      onValidFileChange?.(null);
      return;
    }

    const lower = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lower.endsWith(ext));
    if (!isAllowed) {
      setAttachmentHint(`You can only upload: ${allowedExtensions.join(", ")}`);
      setShowAttachmentHint(true);
      return;
    }

    setFileName(file.name);
    onValidFileChange?.(file);

    const nextUpload = {
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      status: "uploading" as const,
    };
    setUploadState(nextUpload);

    if (simulateFailure) {
      window.setTimeout(() => {
        setUploadState((prev) => (prev ? { ...prev, status: "failed" } : prev));
        setShowUploadToast(true);
      }, 1200);
    }
  };

  useEffect(() => {
    if (!showAttachmentHint) return;
    const fadeTimer = setTimeout(() => setShowAttachmentHint(false), 2200);
    const clearTimer = setTimeout(() => setAttachmentHint(""), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }, [showAttachmentHint]);

  useEffect(() => {
    if (!showUploadToast) return;
    const timer = window.setTimeout(() => setShowUploadToast(false), 2600);
    return () => window.clearTimeout(timer);
  }, [showUploadToast]);

  const removeUpload = () => {
    setFileName("");
    setUploadState(null);
    setShowUploadToast(false);
    onValidFileChange?.(null);
  };

  return (
    <div>
      {!uploadState ? (
        <div className="relative flex h-64 w-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center">
          <div className="text-3xl text-gray-700">
            Drag & Drop files or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 underline underline-offset-2 cursor-pointer hover:text-blue-700"
            >
              browse files
            </button>
          </div>
          {attachmentHint ? (
            <div
              className={`mt-3 rounded-full bg-gray-600 px-4 py-1 text-xs text-white transition-opacity duration-700 ${
                showAttachmentHint ? "opacity-100" : "opacity-0"
              }`}
            >
              {attachmentHint}
            </div>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleAttachmentChange(e.target.files?.[0] || null)}
          />
        </div>
      ) : (
        <div className="relative rounded-xl border border-gray-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-700">
            <button type="button" onClick={removeUpload} className="text-cyan-700 hover:underline">
              Cancel
            </button>
            <span>{uploadState.status === "uploading" ? "Uploading 1 file" : "Upload 1 file"}</span>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="relative w-44 rounded-md bg-[#6f1d1b] p-3 text-white">
              <button
                type="button"
                onClick={removeUpload}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white"
              >
                <X size={12} />
              </button>
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded bg-gray-300 text-black">
                <Paperclip size={18} />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-700">{uploadState.name}</div>
            <div className="text-[11px] text-gray-500">{uploadState.sizeKb} KB</div>
          </div>
          {uploadState.status === "failed" && (
            <>
              <div className="mt-2 h-[2px] w-full bg-red-400" />
              <div className="mt-1 text-xs text-red-600">Upload failed</div>
            </>
          )}
          {showUploadToast && uploadState.status === "failed" && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-600 px-4 py-2 text-xs text-white">
              Failed to upload {uploadState.name}
            </div>
          )}
        </div>
      )}
      {fileName ? <p className="mt-2 text-xs text-gray-500">{fileName}</p> : null}
    </div>
  );
}

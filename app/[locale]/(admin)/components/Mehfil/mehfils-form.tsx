"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { MehfilTables } from "@/app/types/MehfilForm";
import {
  useAddMehfilMutation,
  useUpdateMehfilMutation,
} from "@/store/slicers/mehfilApi";
import { slugify } from "@/utils/slugify";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Upload, Calendar, ChevronDown } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface MehfilFormProps {
  mehfil?: MehfilTables | null;
  visible: boolean;
  onHide: (refresh?: boolean) => void;
}

type FormData = Omit<
  MehfilTables,
  "id" | "created_at" | "updated_at" | "filepath"
> & {
  slug?: string;
  filename?: string;
  updated_by?: number;
  filepath?: string | File;
};

export function MehfilForm({ mehfil, visible, onHide }: MehfilFormProps) {
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const timeOptions = ["تہجد", "فجر", "ظہر", "عصر", "مغرب", "عشا", "اشراق"];
  const mehfilType = [
    "محفل",
    "عيد الاضحی محفل",
    "معراج شریف محفل",
    "شب قدر محفل",
    "۲۷ رمضان محفل",
    "عیدالفطر محفل",
    "دسویں محرم محفل",
    "عید میلادالنبیؐ محفل",
    "۲۱ جمادی الاول محفل",
    "۳ جولائی محفل",
    "شروع کی محفل",
  ];
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title_ur: "",
      title_en: "",
      description: "",
      description_en: "",
      time: "",
      old: "",
      date: "",
      is_published: true,
      type: "",
      filepath: "",
      filename: "",
      created_by: 1,
    },
    mode: "onChange",
  });

  const [createMehfil, { isLoading: isCreating }] = useAddMehfilMutation();
  const [updateMehfil, { isLoading: isUpdating }] = useUpdateMehfilMutation();

  useEffect(() => {
    if (mehfil) {
      reset({
        title_ur: mehfil.title_ur || "",
        title_en: mehfil.title_en || "",
        description: mehfil.description || "default value",
        description_en: mehfil.description_en || "default value",
        time: mehfil.time || "",
        old: mehfil.old || "",
        date: mehfil.date || "",
        is_published: mehfil.is_published,
        type: mehfil.type || "",
        filepath: mehfil.filepath || "",
        filename: mehfil.filename || "filename",
        updated_by: mehfil.updated_by || 1,
      });
    } else {
      reset({
        title_ur: "",
        title_en: "",
        description: "",
        description_en: "",
        time: "",
        old: "",
        is_published: true,
        date: "",
        type: "",
        filepath: "",
        filename: "",
        created_by: 1,
      });
    }
  }, [mehfil, reset]);

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("filepath", file);
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
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setValue("filepath", file);
      setFileUploaded(true);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Check permissions before submission
      const canCreate =
        isSuperAdmin || hasPermission(PERMISSIONS.CREATE_MEHFILS);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_MEHFILS);

      if (mehfil && !canEdit) {
        showError("You don't have permission to edit mehfils.");
        return;
      }

      if (!mehfil && !canCreate) {
        showError("You don't have permission to create mehfils.");
        return;
      }

      const slug = slugify(data?.title_en ?? "");
      const staticFilePath =
        "https://381a.fra1.digitaloceanspaces.com/audio/2018-10-20-magrib.mp3";

      let fileName = "";
      if (data?.filepath) {
        fileName = data?.filepath?.name;
      } else if (typeof data.filepath === "string") {
        fileName = data.filepath.split("/").pop() || "";
      }

      const finalFilePath = staticFilePath + fileName;

      const payload = {
        ...data,
        slug: slug,
        filepath: finalFilePath,
        filename: fileName,
      };

      if (mehfil) {
        await updateMehfil({
          ...payload,
          id: mehfil.id,
        }).unwrap();
        showSuccess("Mehfil updated successfully.");
      } else {
        await createMehfil(payload as MehfilTables).unwrap();
        showSuccess("Mehfil created successfully.");
      }
      onHide(true);
    } catch (error) {
      console.error("Error:", error?.data?.message);
      showError(
        error?.data?.message ||
          `Failed to ${mehfil ? "update" : "create"} mehfil. Please try again.`
      );
    }
  };

  if (!visible) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mehfil ? "Edit Mehfil" : "Create New Mehfil"}
              </h1>
              <p className="text-gray-600 mt-1">
                {mehfil ? "Edit mehfil details" : "Add a new mehfil event"}
              </p>
            </div>
            <button
              onClick={() => onHide()}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Mehfils
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Status Toggle */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <div className="flex items-center justify-start gap-4">
                <div className="flex items-center justify-between gap-2">
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
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mehfil Date *
                  </label>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type="date"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.date.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mehfil Time *
                  </label>
                  <Controller
                    name="time"
                    control={control}
                    rules={{ required: "Time is required" }}
                    render={({ field, fieldState }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select a time</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.time.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English) *
                  </label>
                  <Controller
                    name="title_en"
                    control={control}
                    rules={{ required: "English title is required" }}
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
                    Title (Urdu) *
                  </label>
                  <Controller
                    name="title_ur"
                    control={control}
                    rules={{ required: "Urdu title is required" }}
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
                        dir="rtl"
                      />
                    )}
                  />
                  {errors.title_ur && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.title_ur.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Type and Old Mehfil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mehfil Type *
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Type is required" }}
                    render={({ field, fieldState }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Mehfil Type</option>
                        {mehfilType.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.type.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Old Mehfil *
                  </label>
                  <Controller
                    name="old"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field, fieldState }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Yes or No</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    )}
                  />
                  {errors.old && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.old.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Urdu) *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
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
                        dir="rtl"
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

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Audio File *
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload audio file for this mehfil. Only MP3, WAV, and OGG
                  files are allowed.
                </p>
                <Controller
                  name="filepath"
                  control={control}
                  rules={{ required: "Audio file is required" }}
                  render={({ field }) => (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragOver
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag & Drop your audio file or{" "}
                        <label className="text-blue-600 cursor-pointer hover:text-blue-500">
                          browse files
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </p>
                      {watch("filepath") && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {(watch("filepath") as File)?.name}
                        </p>
                      )}
                      {mehfil?.filepath && !watch("filepath") && (
                        <p className="text-sm text-gray-600 mt-2">
                          Current file:{" "}
                          {mehfil.filename || mehfil.filepath.split("/").pop()}
                        </p>
                      )}
                    </div>
                  )}
                />
                {errors.filepath && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.filepath.message as string}
                  </p>
                )}
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
                    {mehfil ? "Updating..." : "Creating..."}
                  </>
                ) : mehfil ? (
                  "Update Mehfil"
                ) : (
                  "Create Mehfil"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

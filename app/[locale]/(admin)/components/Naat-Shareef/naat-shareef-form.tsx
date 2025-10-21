"use client";
import * as yup from "yup";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import type {
  NaatShareefFormData,
  NaatShareefFormProps,
  NaatShareef,
} from "../../../../types/Naat-Taleemat";
import { useGetCategoriesQuery } from "@/store/slicers/categoryApi";
import { useGetTagsQuery } from "@/store/slicers/tagsApi";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Upload, Calendar, ChevronDown, X } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { useDebounce } from "@/hooks/useDebounce";

// Updated schema to match the form fields
const schema: any = yup.object().shape({
  is_published: yup.boolean().required("Please select Published Status"),
  for_karkuns: yup.boolean(),
  for_ehad_karkuns: yup.boolean(),
  category_id: yup.string().required("Please select category."),
  track: yup.string().required("Please enter the Track."),
  track_date: yup.string(),
  tags: yup.string(),
  title_en: yup.string().required("Please enter a title in English."),
  title_ur: yup.string().required("Please enter a title in Urdu."),
  description_en: yup.string(),
  description_ur: yup.string(),
  audioFile: yup
    .mixed()
    .test("fileType", "Only audio files are allowed", (value: any) => {
      return !value || (value && value.type && value.type.startsWith("audio/"));
    }),
});

// 2. KEPT EXACT SAME PROPS INTERFACE
const NaatShareefForm: React.FC<NaatShareefFormProps> = ({
  type,
  customFieldLabels = {},
  onCancel,
  onSubmit,
  onAddNewData,
  onUpdateData,
  editingItem,
}) => {
  // State management
  const { showError, showSuccess } = useToast();
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [tagsSearch, setTagsSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [showTagsDropdown, setShowTagsDropdown] = useState<boolean>(false);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  // 4. KEPT ALL API CALLS
  const { data: categoryData } = useGetCategoriesQuery({
    page: 1,
    size: 100,
    search: "",
  });

  const debouncedTagsSearch = useDebounce(tagsSearch, 300);

  const { data: tagsData } = useGetTagsQuery({
    page: 1,
    size: 50,
    search: debouncedTagsSearch,
    debouncedSearch: debouncedTagsSearch,
  });

  const categoryOptions = (categoryData?.data || []).map((cat) => ({
    label: cat.title_en,
    value: cat.id.toString(),
  }));

  const { user, hasPermission, isSuperAdmin } = usePermissions();

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
      is_published: editingItem ? editingItem.is_published === "1" : true,
      for_karkuns: false,
      for_ehad_karkuns: false,
      category_id: editingItem?.category_id || "",
      track: editingItem?.track || "",
      track_date: "",
      tags: editingItem?.tags || "",
      title_en: editingItem?.title_en || "",
      title_ur: editingItem?.title_ur || "",
      description_en: editingItem?.description_en || "",
      description_ur: editingItem?.description_ur || "",
      audioFile: null,
    },
  });

  // Update form when editing item changes
  useEffect(() => {
    if (editingItem) {
      reset({
        is_published: editingItem.is_published === "1",
        for_karkuns: false,
        for_ehad_karkuns: false,
        category_id: editingItem.category_id || "",
        track: editingItem.track || "",
        track_date: "",
        tags: editingItem.tags || "",
        title_en: editingItem.title_en || "",
        title_ur: editingItem.title_ur || "",
        description_en: editingItem.description_en || "",
        description_ur: editingItem.description_ur || "",
        audioFile: null,
      });

      // Parse existing tags if they exist
      if (editingItem.tags) {
        const tagNames = editingItem.tags.split(", ");
        // We'll need to fetch the full tag objects, for now just set the names
        setSelectedTags(
          tagNames.map((name, index) => ({
            tag_id: index + 1000, // Temporary ID for existing tags
            name: name.trim(),
          }))
        );
      }
    } else {
      setSelectedTags([]);
      setTagsSearch("");
    }
  }, [editingItem, reset]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 7. KEPT EXACT SAME SUBMIT HANDLER
  const handleFormSubmit: SubmitHandler<any> = async (formData) => {
    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_NAATS);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_NAATS);

      if (editingItem && !canEdit) {
        showError("You don't have permission to edit naats.");
        return;
      }

      if (!editingItem && !canCreate) {
        showError("You don't have permission to create naats.");
        return;
      }

      const slug = formData.title_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      let filename = "";
      let filepath = "";

      if (formData.audioFile) {
        filename = formData.audioFile.name;
        filepath = `/uploads/naats/${filename}`;
        setFileUploaded(true);
      }

      const itemData: Partial<NaatShareef> = {
        slug,
        title_en: formData.title_en,
        title_ur: formData.title_ur,
        description_en: formData.description_en,
        description_ur: formData.description_ur,
        category_id:
          typeof formData.category_id === "string"
            ? parseInt(formData.category_id, 10).toString()
            : formData?.category_id?.toString(),
        track: formData.track,
        is_published:
          typeof formData.is_published === "boolean"
            ? formData.is_published
              ? "1"
              : "0"
            : formData.is_published,
        tags: formData.tags,
        filename: filename || editingItem?.filename,
        filepath: filepath || editingItem?.filepath,
      };

      if (editingItem) {
        const updateNaatData = { ...itemData, updated_by: user?.name };
        await onUpdateData?.(updateNaatData);
        showSuccess("Naat Shareef updated successfully!");
      } else {
        const addNewNaatData = { ...itemData, created_by: user?.name };
        await onAddNewData(addNewNaatData);
        showSuccess("Naat Shareef created successfully!");
      }

      if (onSubmit) {
        await onSubmit(itemData);
      }

      onCancel();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(error?.data?.message || " request filed please try again.");
    }
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("audioFile", file);
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
      setValue("audioFile", file);
      setFileUploaded(true);
    }
  };

  // Tag selection handlers
  const handleTagSelect = (tag: any) => {
    if (!selectedTags.find((t) => t.tag_id === tag.tag_id)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      setValue("tags", newSelectedTags.map((t) => t.name).join(", "));
    }
    setTagsSearch("");
    setShowTagsDropdown(false);
  };

  const handleTagRemove = (tagId: number) => {
    const newSelectedTags = selectedTags.filter((t) => t.tag_id !== tagId);
    setSelectedTags(newSelectedTags);
    setValue("tags", newSelectedTags.map((t) => t.name).join(", "));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {type || "Create Naat Shareef"}
              </h1>
              <p className="text-gray-600 mt-1">
                {editingItem
                  ? "Edit naat shareef details"
                  : "Add a new naat shareef"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Naat Shareefs
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Status Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <div className="flex items-center justify-start gap-4">
                {/* Published Toggle */}
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

                {/* For Karkuns Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    For Karkuns
                  </label>
                  <Controller
                    name="for_karkuns"
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

                {/* For Ehad Karkuns Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    For Ehad Karkuns
                  </label>
                  <Controller
                    name="for_ehad_karkuns"
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
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Track and Track Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track
                  </label>
                  <Controller
                    name="track"
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
                        placeholder="Enter track information"
                      />
                    )}
                  />
                  {errors.track && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.track.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Track Date
                  </label>
                  <Controller
                    name="track_date"
                    control={control}
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

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category_id.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="relative" ref={tagsDropdownRef}>
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={tagsSearch}
                        onChange={(e) => {
                          setTagsSearch(e.target.value);
                          setShowTagsDropdown(true);
                        }}
                        onFocus={() => setShowTagsDropdown(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search and select tags..."
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    {/* Selected Tags Display */}
                    {selectedTags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag.tag_id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag.tag_id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Dropdown */}
                    {showTagsDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {tagsData?.data && tagsData.data.length > 0 ? (
                          tagsData.data
                            .filter(
                              (tag) =>
                                !selectedTags.find(
                                  (t) => t.tag_id === tag.tag_id
                                )
                            )
                            .map((tag) => (
                              <div
                                key={tag.tag_id}
                                onClick={() => handleTagSelect(tag)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              >
                                <div className="font-medium">{tag.name}</div>
                                {tag.description && (
                                  <div className="text-gray-500 text-xs">
                                    {tag.description}
                                  </div>
                                )}
                              </div>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            {tagsSearch
                              ? "No tags found"
                              : "Start typing to search tags"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hidden input for form submission */}
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="hidden"
                        value={selectedTags.map((t) => t.name).join(", ")}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Audio File *
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload audio file for this naat. Only MP3, WAV, and OGG files
                  are allowed.
                </p>
                <Controller
                  name="audioFile"
                  control={control}
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
                      {watch("audioFile") && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {(watch("audioFile") as File)?.name}
                        </p>
                      )}
                      {editingItem?.filepath && !watch("audioFile") && (
                        <p className="text-sm text-gray-600 mt-2">
                          Current file:{" "}
                          {editingItem.filename ||
                            editingItem.filepath.split("/").pop()}
                        </p>
                      )}
                    </div>
                  )}
                />
                {errors.audioFile && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.audioFile.message as string}
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
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : editingItem ? (
                  "Update Naat"
                ) : (
                  "Create Naat"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NaatShareefForm;

"use client";
import React, { useState, useEffect, useRef } from "react";
import { type Taleemat } from "../../../../../store/slicers/taleematApi";
import { useGetCategoriesQuery } from "@/store/slicers/categoryApi";
import { useGetTagsQuery } from "@/store/slicers/tagsApi";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Upload, ChevronDown, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import AudioPlayer from "@/components/AudioPlayer";

// Define the Tag interface if not imported
interface TagType {
  tag_id: number;
  name: string;
}

interface TaleematFormProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: Omit<Taleemat, "id">) => void;
  initialData: Taleemat | null;
}

const TaleematForm: React.FC<TaleematFormProps> = ({
  visible,
  onHide,
  onSubmit,
  initialData,
}) => {
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [formData, setFormData] = useState<Omit<Taleemat, "id">>({
    title_en: "",
    title_ur: "",
    description: "",
    track: "",
    tags: "",
    filename: "https://381a.fra1.digitaloceanspaces.com/audio/",
    category_id: 4,
    is_published: 1,
    filepath: "https://381a.fra1.digitaloceanspaces.com/audio/",
    slug: "",
    created_by: 1,
    created_at: new Date().toISOString(),
  });

  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [tagsSearch, setTagsSearch] = useState<string>("");
  const [showTagsDropdown, setShowTagsDropdown] = useState<boolean>(false);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  const { data: categoryData } = useGetCategoriesQuery({
    page: 1,
    size: 100,
    search: "",
  });

  const debouncedTagsSearch = useDebounce(tagsSearch, 300);

  const { data: tagData, isLoading: isTagsLoading } = useGetTagsQuery({
    page: 1,
    size: 50,
    search: debouncedTagsSearch,
    debouncedSearch: debouncedTagsSearch,
  });

  const categoryOptions =
    categoryData?.data?.map((category) => ({
      label: category.title_en,
      value: category.id,
    })) || [];

  const tagOptions =
    tagData?.data?.map((tag) => ({
      label: tag.name,
      value: tag.tag_id,
      tag: tag,
    })) || [];

  const publishedOptions = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  const generateSlug = (title: string): string => {
    const timestamp = Math.floor(Date.now() / 1000);
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${baseSlug}-${timestamp}`;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title_en: initialData.title_en || "",
        title_ur: initialData.title_ur || "",
        description: initialData.description || "",
        track: initialData.track || "",
        tags: initialData.tags || "",
        filename:
          initialData.filename ||
          "https://381a.fra1.digitaloceanspaces.com/audio/",
        category_id: initialData.category_id ?? 4,
        is_published: initialData.is_published ?? 1,
        filepath:
          initialData.filepath ||
          "https://381a.fra1.digitaloceanspaces.com/audio/",
        slug: initialData.slug || "",
        updated_by: initialData.updated_by || 1,
        updated_at: initialData.updated_at || new Date().toISOString(),
      });
      setFileUploaded(false);

      // We'll set selected tags after the tag data is loaded
    } else {
      setFormData({
        title_en: "",
        title_ur: "",
        description: "",
        track: "",
        tags: "",
        filename: "https://381a.fra1.digitaloceanspaces.com/audio/",
        category_id: 4,
        is_published: 1,
        filepath: "https://381a.fra1.digitaloceanspaces.com/audio/",
        slug: "",
      });
      setSelectedTags([]);
      setFileUploaded(false);
    }
  }, [initialData, visible]);

  // Separate useEffect to handle tag selection after tags are loaded
  useEffect(() => {
    if (initialData?.tags && tagData?.data && !isTagsLoading) {
      try {
        const tagNames = initialData.tags.split(",").map((tag) => tag.trim());
        const matchedTags = tagData.data.filter((tag) =>
          tagNames.includes(tag.name)
        );
        setSelectedTags(matchedTags);
      } catch (err) {
        console.error("Error parsing tags:", err);
        setSelectedTags([]);
      }
    }
  }, [initialData, tagData, isTagsLoading]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "title_en") {
        return {
          ...prev,
          [name]: value,
          slug: generateSlug(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        filename: file.name,
        filepath: `https://381a.fra1.digitaloceanspaces.com/audio/${file.name}`,
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
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setFormData((prev) => ({
        ...prev,
        filename: file.name,
        filepath: `https://381a.fra1.digitaloceanspaces.com/audio/${file.name}`,
      }));
      setFileUploaded(true);
    }
  };

  // Tag selection handlers
  const handleTagSelect = (tag: any) => {
    if (!selectedTags.find((t) => t.tag_id === tag.tag_id)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      setFormData((prev) => ({
        ...prev,
        tags: newSelectedTags.map((t) => t.name).join(", "),
      }));
    }
    setTagsSearch("");
    setShowTagsDropdown(false);
  };

  const handleTagRemove = (tagId: number) => {
    const newSelectedTags = selectedTags.filter((t) => t.tag_id !== tagId);
    setSelectedTags(newSelectedTags);
    setFormData((prev) => ({
      ...prev,
      tags: newSelectedTags.map((t) => t.name).join(", "),
    }));
  };

  const handleSubmit = () => {
    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_TALEEMAT);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_TALEEMAT);
      
      if (initialData && !canEdit) {
        showError("You don't have permission to edit taleemat.");
        return;
      }
      
      if (!initialData && !canCreate) {
        showError("You don't have permission to create taleemat.");
        return;
      }

      const dataToSubmit = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title_en),
      };

      onSubmit(dataToSubmit);
    } catch (error) {
      showError("Failed to submit form. Please try again.");
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
                {initialData ? "Edit Taleemat" : "Create New Taleemat"}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData
                  ? "Edit taleemat details"
                  : "Add a new Islamic teaching"}
              </p>
            </div>
            <button
              onClick={onHide}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Taleemat
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-8"
          >
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
                    Title (Urdu)
                  </label>
                  <input
                    type="text"
                    name="title_ur"
                    value={formData.title_ur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title in Urdu"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Track and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CD Track
                  </label>
                  <input
                    type="text"
                    name="track"
                    value={formData.track}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter track information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter description"
                />
              </div>

              {/* Tags */}
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
                    <div className="mt-2 flex flex-wrap gap-2">
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
                      {tagData?.data && tagData.data.length > 0 ? (
                        tagData.data
                          .filter(
                            (tag) =>
                              !selectedTags.find((t) => t.tag_id === tag.tag_id)
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
              </div>

              {/* Uploaded Audio File - show when editing with existing audio */}
              {initialData &&
                formData.filepath &&
                formData.filepath !== "https://381a.fra1.digitaloceanspaces.com/audio/" &&
                !formData.filepath.endsWith("/") && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Uploaded Audio File
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <AudioPlayer
                        src={formData.filepath}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {initialData ? "Replace Audio File" : "Upload Audio File"}
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  {initialData
                    ? "Upload a new file to replace the current audio."
                    : "Upload audio file for this taleemat. Only MP3, WAV, and OGG files are allowed."}
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
                  {fileUploaded && formData.filename && (
                    <p className="text-sm text-green-600 mt-2">
                      {initialData ? "New file selected: " : "Selected: "}
                      {formData.filename}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {initialData ? "Update Taleemat" : "Create Taleemat"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaleematForm;

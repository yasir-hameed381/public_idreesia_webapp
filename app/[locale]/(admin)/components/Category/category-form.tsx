"use client";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Category } from "@/app/types/category";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/store/slicers/categoryApi";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface CategoryFormProps {
  category?: Category;
  open: boolean;
  onClose: () => void;
}

type FormData = Omit<Category, "id" | "created_at" | "updated_at">;

export function CategoryForm({ category, open, onClose }: CategoryFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title_en: "",
      title_ur: "",
      slug: "",
      status: 0,
    },
  });

  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // 🔄 Reset form only when the dialog opens
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          title_en: category.title_en,
          title_ur: category.title_ur,
          slug: category.slug,
          status: category.status,
        });
      } else {
        reset({
          title_en: "",
          title_ur: "",
          slug: "",
          status: 0,
        });
      }
    }
  }, [open, category, reset]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  const onSubmit = async (data: FormData) => {
    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_CATEGORIES);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_CATEGORIES);
      
      if (category && !canEdit) {
        showError("You don't have permission to edit categories.");
        return;
      }
      
      if (!category && !canCreate) {
        showError("You don't have permission to create categories.");
        return;
      }

      // Ensure status is included in the data
      const submitData = {
        ...data,
        status: data.status || 0,
      };

      if (category) {
        await updateCategory({ id: category.id, data: submitData }).unwrap();
        showSuccess("Category updated successfully.");
      } else {
        await createCategory(submitData).unwrap();
        showSuccess("Category created successfully.");
      }
      reset();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      showError(
        error?.data?.message ||
          "Failed to " + (category ? "update" : "create") + " category."
      );
    }
  };

  const getFormErrorMessage = (name: keyof FormData) => {
    return errors[name] ? (
      <small className="text-red-400 text-sm mt-1">
        {errors[name]?.message}
      </small>
    ) : null;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {category ? "Edit Category" : "Create Category"}
            </h1>
            <p className="text-gray-600 text-sm">
              {category
                ? "Update category information"
                : "Create a new category for organizing taleemat"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(field.value === 1 ? 0 : 1)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      field.value === 1 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        field.value === 1 ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Title Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title (English) */}
              <div>
                <label
                  htmlFor="title_en"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Title (English) *
                </label>
                <Controller
                  name="title_en"
                  control={control}
                  rules={{ required: "English title is required" }}
                  render={({ field, fieldState }) => (
                    <div>
                      <input
                        id={field.name}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          const generatedSlug = value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "");
                          setValue("slug", generatedSlug);
                        }}
                        className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldState.error ? "border-red-500" : ""
                        }`}
                        placeholder="Enter English title"
                      />
                      {getFormErrorMessage("title_en")}
                    </div>
                  )}
                />
              </div>

              {/* Title (Urdu) */}
              <div>
                <label
                  htmlFor="title_ur"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Title (Urdu)
                </label>
                <Controller
                  name="title_ur"
                  control={control}
                  rules={{ required: "Urdu title is required" }}
                  render={({ field, fieldState }) => (
                    <div>
                      <input
                        id={field.name}
                        {...field}
                        dir="rtl"
                        className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          fieldState.error ? "border-red-500" : ""
                        }`}
                        placeholder="اردو عنوان درج کریں"
                      />
                      {getFormErrorMessage("title_ur")}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Hidden input for slug */}
            <Controller
              name="slug"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {category ? "Updating..." : "Creating..."}
                  </div>
                ) : category ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

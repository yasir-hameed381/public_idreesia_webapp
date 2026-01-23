"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useAddZoneMutation,
  useUpdateZoneMutation,
} from "../../../../../store/slicers/zoneApi";
import { ZoneFormData } from "../../../../types/Zone";
import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
// Define validation schema
const zoneSchema = yup.object().shape({
  title_en: yup.string().required("Title (EN) is required"),
  title_ur: yup.string().required("Title (UR) is required"),
  country_en: yup.string().required("Country (EN) is required"),
  country_ur: yup.string().required("Country (UR) is required"),
  city_en: yup.string().required("City (EN) is required"),
  city_ur: yup.string().required("City (UR) is required"),
  ceo: yup.string(),
  primary_phone_number: yup
    .string()
    .test(
      "len",
      "Phone number must be exactly 11 digits",
      (val) => !val || val.length === 11
    ),
  secondary_phone_number: yup
    .string()
    .test(
      "len",
      "Phone number must be exactly 11 digits",
      (val) => !val || val.length === 11
    ),
  description: yup.string(),
});

export function ZoneForm({ editData, onCancel, onSuccess }) {
  const [addZone, { isLoading, error: apiError }] = useAddZoneMutation();
  const [updateZone] = useUpdateZoneMutation();
  const { hasPermission, isSuperAdmin } = usePermissions();
  type ZoneFormSchemaType = yup.InferType<typeof zoneSchema>;
  const { showError, showSuccess } = useToast();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<ZoneFormSchemaType>({
    resolver: yupResolver(zoneSchema),
    defaultValues: {
      title_en: "",
      title_ur: "",
      description: "",
      country_en: "",
      country_ur: "",
      city_en: "",
      city_ur: "",
      ceo: "",
      primary_phone_number: "",
      secondary_phone_number: "",
    },
  });
  useEffect(() => {
    if (editData) {
      reset({
        title_en: editData.title_en ?? "",
        title_ur: editData.title_ur ?? "",
        description: editData.description ?? "",
        country_en: editData.country_en ?? "",
        country_ur: editData.country_ur ?? "",
        city_en: editData.city_en ?? "",
        city_ur: editData.city_ur ?? "",
        ceo: editData.ceo ?? "",
        primary_phone_number: editData.primary_phone_number ?? "",
        secondary_phone_number: editData.secondary_phone_number ?? "",
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: ZoneFormData) => {
    try {
      // Check permissions before submission
      const canCreate = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_ZONES);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_ZONES);

      if (editData?.id && !canEdit) {
        showError("You don't have permission to edit zones.");
        return;
      }

      if (!editData?.id && !canCreate) {
        showError("You don't have permission to create zones.");
        return;
      }

      // Transform snake_case to camelCase for backend API
      const apiPayload = {
        titleEn: data.title_en,
        titleUr: data.title_ur,
        description: data.description || "",
        countryEn: data.country_en,
        countryUr: data.country_ur,
        cityEn: data.city_en,
        cityUr: data.city_ur,
        co: data.ceo || "",
        primaryPhoneNumber: data.primary_phone_number || "",
        secondaryPhoneNumber: data.secondary_phone_number || "",
      };

      if (editData?.id) {
        const result = await updateZone({
          id: editData.id,
          ...apiPayload,
        }).unwrap();
        reset();
        showSuccess("Zone updated successfully.");
        onSuccess("Zone updated successfully!");
      } else {
        const result = await addZone(apiPayload).unwrap();
        reset();
        showSuccess("Zone created successfully.");
        onSuccess("Zone created successfully!");
      }
    } catch (err: any) {
      console.error("API error:", err);
      // Handle RTK Query error formats
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        (err as { message?: string })?.message ||
        (err as { error?: string })?.error ||
        "Operation failed. Please try again.";
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editData ? "Edit Zone" : "Create Zone"}
              </h1>
              <p className="text-gray-600 mt-1">
                {editData
                  ? "Edit zone information and details"
                  : "Add a new zone with location details"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Zones
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Title Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>
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
            </div>

            {/* Location Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (English) *
                  </label>
                  <Controller
                    name="country_en"
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
                        placeholder="Enter country in English"
                      />
                    )}
                  />
                  {errors.country_en && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country_en.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Urdu) *
                  </label>
                  <Controller
                    name="country_ur"
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
                        placeholder="Enter country in Urdu"
                      />
                    )}
                  />
                  {errors.country_ur && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country_ur.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (English) *
                  </label>
                  <Controller
                    name="city_en"
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
                        placeholder="Enter city in English"
                      />
                    )}
                  />
                  {errors.city_en && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city_en.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (Urdu) *
                  </label>
                  <Controller
                    name="city_ur"
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
                        placeholder="Enter city in Urdu"
                      />
                    )}
                  />
                  {errors.city_ur && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city_ur.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEO
                  </label>
                  <Controller
                    name="ceo"
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
                        placeholder="Enter CEO name"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number
                  </label>
                  <Controller
                    name="primary_phone_number"
                    control={control}
                    render={({ field, fieldState }) => (
                      <input
                        {...field}
                        type="tel"
                        maxLength={11}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter primary phone number"
                      />
                    )}
                  />
                  {errors.primary_phone_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.primary_phone_number.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone Number
                  </label>
                  <Controller
                    name="secondary_phone_number"
                    control={control}
                    render={({ field, fieldState }) => (
                      <input
                        {...field}
                        type="tel"
                        maxLength={11}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldState.invalid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter secondary phone number"
                      />
                    )}
                  />
                  {errors.secondary_phone_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.secondary_phone_number.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <textarea
                      {...field}
                      rows={5}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        fieldState.invalid
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter zone description"
                    />
                  )}
                />
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
                    {editData ? "Updating..." : "Creating..."}
                  </>
                ) : editData ? (
                  "Update Zone"
                ) : (
                  "Create Zone"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

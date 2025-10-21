"use client";
import * as yup from "yup";
import type React from "react";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useFetchZonesQuery } from "@/store/slicers/zoneApi";
import { useToast } from "@/hooks/useToast";
import {
  ArrowLeft,
  ChevronDown,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import {
  useCreateKarkunJoinRequestMutation,
  useUpdateKarkunJoinRequestMutation,
} from "@/store/slicers/karkunJoinRequestsApi";

// Updated schema to match the backend model exactly
const schema: any = yup.object().shape({
  avatar: yup.string().url("Please enter a valid URL"),
  first_name: yup.string().required("Please enter first name."),
  last_name: yup.string().required("Please enter last name."),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Please enter email address."),
  phone_no: yup.string().required("Please enter phone number."),
  user_type: yup.string().required("Please select user type."),
  birth_year: yup.string().required("Please enter birth year."),
  ehad_year: yup.string().required("Please enter ehad year."),
  zone_id: yup.number().required("Please select a zone."),
  city: yup.string().required("Please enter city."),
  country: yup.string().required("Please enter country."),
  is_approved: yup.boolean(),
});

interface KarkunJoinRequestFormProps {
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

const USER_TYPES = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
];

const COUNTRIES = [
  "Pakistan",
  "India",
  "Bangladesh",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Saudi Arabia",
  "Other",
];

export function KarkunJoinRequestForm({
  onClose,
  initialData,
  onSuccess,
}: KarkunJoinRequestFormProps) {
  // State management
  const { showError, showSuccess } = useToast();

  // API calls
  const { data: zonesData } = useFetchZonesQuery({
    page: 1,
    per_page: 100,
    search: "",
  });

  const zoneOptions = (zonesData?.data || []).map((zone) => ({
    label: zone.title_en,
    value: zone.id,
  }));

  const { user } = usePermissions();
  const [createKarkunJoinRequest] = useCreateKarkunJoinRequestMutation();
  const [updateKarkunJoinRequest] = useUpdateKarkunJoinRequestMutation();

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
      avatar: initialData?.avatar || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone_no: initialData?.phone_no || "",
      user_type: initialData?.user_type || "",
      birth_year: initialData?.birth_year || "",
      ehad_year: initialData?.ehad_year || "",
      zone_id: initialData?.zone_id || "",
      city: initialData?.city || "",
      country: initialData?.country || "",
      is_approved: initialData ? initialData.is_approved : false,
    },
  });

  // Update form when editing item changes
  useEffect(() => {
    if (initialData) {
      reset({
        avatar: initialData.avatar || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone_no: initialData.phone_no || "",
        user_type: initialData.user_type || "",
        birth_year: initialData.birth_year || "",
        ehad_year: initialData.ehad_year || "",
        zone_id: initialData.zone_id || "",
        city: initialData.city || "",
        country: initialData.country || "",
        is_approved: initialData.is_approved || false,
      });
    } else {
      // Reset form for new request
      reset({
        avatar: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_no: "",
        user_type: "",
        birth_year: "",
        ehad_year: "",
        zone_id: "",
        city: "",
        country: "",
        is_approved: false,
      });
    }
  }, [initialData, reset]);

  // Submit handler
  const handleFormSubmit: SubmitHandler<any> = async (formData) => {
    try {
      // Prepare payload that matches backend model exactly
      const requestData: any = {
        avatar: formData.avatar || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_no: formData.phone_no,
        user_type: formData.user_type,
        birth_year: formData.birth_year,
        ehad_year: formData.ehad_year,
        zone_id: parseInt(formData.zone_id, 10),
        city: formData.city,
        country: formData.country,
        is_approved: formData.is_approved,
      };

      console.log("=== PAYLOAD BEING SENT ===");
      console.log("Form Data:", formData);
      console.log("Processed Payload:", requestData);

      if (initialData) {
        const updateRequestData = {
          ...requestData,
          updated_by: user?.id ? user.id.toString() : "",
        };
        await updateKarkunJoinRequest({
          id: initialData.id,
          ...updateRequestData,
        }).unwrap();
        showSuccess("Karkun join request updated successfully!");
      } else {
        const addNewRequestData = {
          ...requestData,
          created_by: user?.id ? user.id.toString() : "",
        };
        await createKarkunJoinRequest(addNewRequestData).unwrap();
        showSuccess("Karkun join request created successfully!");
      }

      // Call onSuccess callback to refresh the table
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(error?.data?.message || "Request failed please try again.");
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
                {initialData
                  ? "Edit Karkun Join Request"
                  : "Create Karkun Join Request"}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData
                  ? "Edit karkun join request details"
                  : "Add a new karkun join request to the system"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Karkun Join Requests
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Approval Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Approved
                </label>
                <Controller
                  name="is_approved"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        field.value ? "bg-green-600" : "bg-gray-200"
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

            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      First Name *
                    </label>
                    <Controller
                      name="first_name"
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
                          placeholder="Enter first name"
                        />
                      )}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Last Name *
                    </label>
                    <Controller
                      name="last_name"
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
                          placeholder="Enter last name"
                        />
                      )}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address *
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="email"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter email address"
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number *
                    </label>
                    <Controller
                      name="phone_no"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="tel"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter phone number"
                        />
                      )}
                    />
                    {errors.phone_no && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone_no.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <Controller
                      name="avatar"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="url"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter avatar URL"
                        />
                      )}
                    />
                    {errors.avatar && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.avatar.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type *
                    </label>
                    <Controller
                      name="user_type"
                      control={control}
                      render={({ field, fieldState }) => (
                        <div className="relative">
                          <select
                            {...field}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                              fieldState.invalid
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select user type</option>
                            {USER_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    />
                    {errors.user_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.user_type.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Birth Year *
                    </label>
                    <Controller
                      name="birth_year"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="number"
                          min="1900"
                          max="2024"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter birth year"
                        />
                      )}
                    />
                    {errors.birth_year && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.birth_year.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Ehad Year *
                    </label>
                    <Controller
                      name="ehad_year"
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="number"
                          min="1900"
                          max="2024"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter ehad year"
                        />
                      )}
                    />
                    {errors.ehad_year && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.ehad_year.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Zone *
                  </label>
                  <Controller
                    name="zone_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <select
                          {...field}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select zone</option>
                          {zoneOptions.map((zone) => (
                            <option key={zone.value} value={zone.value}>
                              {zone.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  />
                  {errors.zone_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.zone_id.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    City *
                  </label>
                  <Controller
                    name="city"
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
                        placeholder="Enter city"
                      />
                    )}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message as string}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Country *
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <select
                          {...field}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                            fieldState.invalid
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country.message as string}
                    </p>
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
                    {initialData ? "Updating..." : "Creating..."}
                  </>
                ) : initialData ? (
                  "Update Request"
                ) : (
                  "Create Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

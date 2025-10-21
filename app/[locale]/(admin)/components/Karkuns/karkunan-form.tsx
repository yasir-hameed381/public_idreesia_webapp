"use client";
import type React from "react";
import { useForm } from "react-hook-form";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

interface KarkunanFormData {
  id?: number;
  name: string;
  email: string;
  phone_number: string | null;
  cnic_no?: string;
  father_name: string | null;
  user_type: string;
  zone_id: string | number | null;
  mehfil_directory_id: string | number | null;
  ehad_year: string | number | null;
  birth_year: string | number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  password?: string;
  confirmPassword?: string;
  duty_type?: string;
  duty_days: string[];
  is_zone_admin?: boolean;
  is_mehfil_admin?: boolean;
}

export function KarkunanForm({
  editData,
  onCancel,
  onSuccess,
}: {
  editData?: KarkunanFormData | null;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: "",
    search: "",
  });
  const { showError, showSuccess } = useToast();
  const ALL_ZONES = zonesData?.data || [];
  const ALL_MEHFILS = mehfilData?.data || [];
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<KarkunanFormData>({
    defaultValues: {
      duty_days: [],
      is_zone_admin: false,
      is_mehfil_admin: false,
    },
  });

  // Set form values when editData changes
  useEffect(() => {
    if (editData) {
      console.log("Setting form with edit data:", editData);
      reset({
        id: editData.id,
        name: editData.name || "",
        father_name: editData.father_name || "",
        phone_number: editData.phone_number || "",
        cnic_no: editData.cnic_no || "",
        address: editData.address || "",
        birth_year: editData.birth_year?.toString() || "",
        ehad_year: editData.ehad_year?.toString() || "",
        duty_days: editData.duty_days || [],
        duty_type: editData.duty_type || "",
        zone_id: editData.zone_id?.toString() || "",
        mehfil_directory_id: editData.mehfil_directory_id?.toString() || "",
        email: editData.email || "",
        user_type: editData.user_type || "",
        city: editData.city || "",
        country: editData.country || "",
        is_zone_admin: editData.is_zone_admin || false,
        is_mehfil_admin: editData.is_mehfil_admin || false,
      });
    }
  }, [editData, reset]);

  const onSubmit = async (formData: KarkunanFormData) => {
    try {
      // Check permissions before submission
      const canCreate =
        isSuperAdmin || hasPermission(PERMISSIONS.CREATE_KARKUNAN);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_KARKUNAN);

      if (editData && !canEdit) {
        showError("You don't have permission to edit karkunan.");
        return;
      }

      if (!editData && !canCreate) {
        showError("You don't have permission to create karkunan.");
        return;
      }

      console.log("Form data submitted:", formData);

      // Prepare the data for API call
      const apiData: any = {
        name: formData.name,
        email: formData.email,
        father_name: formData.father_name,
        phone_number: formData.phone_number,
        id_card_number: formData.cnic_no,
        address: formData.address,
        birth_year: parseInt(String(formData.birth_year)) || 0,
        ehad_year: parseInt(String(formData.ehad_year)) || 0,
        duty_days: formData.duty_days,
        duty_type: formData.duty_type,
        city: formData.city,
        country: formData.country,
        user_type: formData.user_type,
        zone_id: formData.zone_id ? parseInt(String(formData.zone_id)) : null,
        mehfil_directory_id: formData.mehfil_directory_id
          ? parseInt(String(formData.mehfil_directory_id))
          : null,
        is_zone_admin: formData.is_zone_admin || false,
        is_mehfil_admin: formData.is_mehfil_admin || false,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== "") {
        apiData.password = formData.password;
      }

      console.log("API data being sent:", apiData);

      if (editData && editData.id) {
        setIsUpdating(true);
        await AdminUsersService.update(editData.id, apiData);
        showSuccess("Karkun updated successfully!");
      } else {
        setIsLoading(true);
        await AdminUsersService.create(apiData);
        showSuccess("Karkun added successfully!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving Karkun:", error);
      showError(error.message || "Failed to save Karkun. Please try again.");
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  if (isLoading || isUpdating) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
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
            Back to Karkuns
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {editData ? "Edit Karkun" : "Create Karkun"}
          </h1>
          <p className="text-gray-600 mt-1">
            {editData
              ? "Update karkun information"
              : "Create a new karkun account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            {/* Admin Roles */}
            <div className="flex gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_zone_admin")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Zone Admin
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_mehfil_admin")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Mehfil Admin
                </span>
              </label>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register("phone_number")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03XXXXXXXXX"
                />
              </div>

              {/* ID Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Card Number
                </label>
                <input
                  {...register("cnic_no")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXXXXXXXXXXXX"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name
                </label>
                <input
                  {...register("father_name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father's name"
                />
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  {...register("user_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select User Type</option>
                  <option value="karkun">Karkun</option>
                  <option value="ehad_karkun">Ehad Karkun</option>
                </select>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <select
                  {...register("zone_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {ALL_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mehfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil
                </label>
                <select
                  {...register("mehfil_directory_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Mehfil</option>
                  {ALL_MEHFILS.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      {mehfil.address_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ehad Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ehad Year
                </label>
                <input
                  type="number"
                  {...register("ehad_year")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YYYY"
                />
              </div>

              {/* Birth Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Year
                </label>
                <input
                  type="number"
                  {...register("birth_year")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YYYY"
                />
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register("city")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  {...register("country")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editData && ""}
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    editData
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password {!editData && ""}
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    editData
                      ? "Leave blank to keep current password"
                      : "Confirm password"
                  }
                />
              </div>
            </div>

            {/* Duty Type */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duty Type
              </label>
              <input
                {...register("duty_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Morning, Evening"
              />
            </div>

            {/* Duty Days */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Duty Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={day}
                      {...register("duty_days")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
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
              {editData ? "Update Karkun" : "Create Karkun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

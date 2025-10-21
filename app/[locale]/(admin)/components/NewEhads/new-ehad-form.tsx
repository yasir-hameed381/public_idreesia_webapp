"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface NewEhadFormData {
  id?: number;
  name: string;
  father_name: string;
  marfat: string;
  phone_no: string;
  address: string;
  mehfil_directory_id: string | number | null;
  zone_id: string | number | null;
}

interface NewEhadFormProps {
  editData?: NewEhadFormData | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function NewEhadForm({
  editData,
  onCancel,
  onSuccess,
}: NewEhadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: "",
    search: "",
  });

  const ALL_ZONES = zonesData?.data || [];
  const ALL_MEHFILS = mehfilData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<NewEhadFormData>({
    defaultValues: {
      name: "",
      father_name: "",
      marfat: "",
      phone_no: "",
      address: "",
      zone_id: "",
      mehfil_directory_id: "",
    },
  });

  const selectedZone = watch("zone_id");

  // Filter mehfils based on selected zone
  const filteredMehfils = selectedZone
    ? ALL_MEHFILS.filter(
        (mehfil: any) => mehfil.zone_id === parseInt(selectedZone.toString())
      )
    : ALL_MEHFILS;

  // Set form values when editData changes
  useEffect(() => {
    if (editData) {
      reset({
        id: editData.id,
        name: editData.name || "",
        father_name: editData.father_name || "",
        marfat: editData.marfat || "",
        phone_no: editData.phone_no || "",
        address: editData.address || "",
        zone_id: editData.zone_id?.toString() || "",
        mehfil_directory_id: editData.mehfil_directory_id?.toString() || "",
      });
    }
  }, [editData, reset]);

  const onSubmit = async (formData: NewEhadFormData) => {
    try {
      setIsLoading(true);

      const submitData = {
        name: formData.name,
        father_name: formData.father_name,
        marfat: formData.marfat,
        phone_no: formData.phone_no,
        address: formData.address,
        zone_id: parseInt(formData.zone_id?.toString() || "0"),
        mehfil_directory_id: parseInt(
          formData.mehfil_directory_id?.toString() || "0"
        ),
      };

      const url =
        editData && editData.id
          ? `http://localhost:3000/api/new-karkun/update/${editData.id}`
          : "http://localhost:3000/api/new-karkun/add";

      const method = editData && editData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save new ehad");
      }

      showSuccess(
        editData
          ? "New Ehad updated successfully!"
          : "New Ehad created successfully!"
      );
      onSuccess();
    } catch (error: any) {
      console.error("Error saving new ehad:", error);
      showError(error.message || "Failed to save new ehad. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Processing...</span>
        </div>
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
            Back to New Ehads
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {editData ? "Edit New Ehad" : "Create New Ehad"}
          </h1>
          <p className="text-gray-600 mt-1">
            {editData ? "Update new ehad information" : "Add a new ehad entry"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name *
                </label>
                <input
                  {...register("father_name", {
                    required: "Father name is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father's name"
                />
                {errors.father_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.father_name.message}
                  </p>
                )}
              </div>

              {/* Marfat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marfat
                </label>
                <input
                  {...register("marfat")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter marfat"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register("phone_no", {
                    required: "Phone number is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                {errors.phone_no && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_no.message}
                  </p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone *
                </label>
                <select
                  {...register("zone_id", { required: "Zone is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {ALL_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
                {errors.zone_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.zone_id.message}
                  </p>
                )}
              </div>

              {/* Mehfil Directory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil Directory *
                </label>
                <select
                  {...register("mehfil_directory_id", {
                    required: "Mehfil Directory is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Mehfil Directory</option>
                  {filteredMehfils.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      {mehfil.address_en}
                    </option>
                  ))}
                </select>
                {errors.mehfil_directory_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mehfil_directory_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                {...register("address", { required: "Address is required" })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
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
              {editData ? "Update New Ehad" : "Create New Ehad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

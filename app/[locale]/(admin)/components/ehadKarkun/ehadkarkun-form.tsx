"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useAddKarkunMutation,
  useUpdateKarkunMutation,
} from "../../../../../store/slicers/EhadKarkunApi";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { KarkunFormData } from "../../../../types/Ehad-Karkun";
import { useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

const karkunSchema = yup.object().shape({
  zone_id: yup.string().required("Zone is required"),
  name_en: yup.string().required("Name (EN) is required"),
  name_ur: yup.string().required("Name (UR) is required"),
  so_en: yup.string(),
  so_ur: yup.string(),
  mobile_no: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]+$/, "Must be only digits")
    .length(11, "Must be exactly 11 digits"),
  cnic: yup.string().matches(/^[0-9]{13}$|^$/, "CNIC must be 13 digits"),
  city_en: yup.string().required("City (EN) is required"),
  city_ur: yup.string().required("City (UR) is required"),
  country_en: yup.string().required("Country (EN) is required"),
  country_ur: yup.string().required("Country (UR) is required"),
  birth_year: yup
    .date()
    .nullable()
    .max(new Date(), "Birth year cannot be in the future")
    .typeError("Invalid date"),
  ehad_year: yup.date().nullable().typeError("Invalid date"),
  ehad_ijazat_year: yup.date().nullable().typeError("Invalid date"),
  description: yup.string(),
});

export function EhadKarkunForm({ editData, onCancel, onSuccess }) {
  const [addKarkun, { isLoading }] = useAddKarkunMutation();
  const [updateKarkun] = useUpdateKarkunMutation();
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const ALL_ZONES = zonesData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<KarkunFormData>({
    resolver: yupResolver(karkunSchema),
  });

  const birthYear = watch("birth_year");
  const ehadYear = watch("ehad_year");
  const ehadIjazatYear = watch("ehad_ijazat_year");
  const selectedZoneId = watch("zone_id");

  useEffect(() => {
    if (editData) {
      console.log("Edit data received:", editData);
      console.log(
        "Zone ID from edit data:",
        editData.zone_id,
        typeof editData.zone_id
      );

      const formData = {
        zone_id: editData.zone_id ? editData.zone_id.toString() : "",
        name_en: editData.name_en ?? "",
        name_ur: editData.name_ur ?? "",
        so_en: editData.so_en ?? "",
        so_ur: editData.so_ur ?? "",
        mobile_no: editData.mobile_no ?? "",
        cnic: editData.cnic ?? "",
        city_en: editData.city_en ?? "",
        city_ur: editData.city_ur ?? "",
        country_en: editData.country_en ?? "",
        country_ur: editData.country_ur ?? "",
        birth_year: editData.birth_year
          ? new Date(editData.birth_year, 0, 1)
          : null,
        ehad_year: editData.ehad_year
          ? new Date(editData.ehad_year, 0, 1)
          : null,
        ehad_ijazat_year: editData.ehad_ijazat_year
          ? new Date(editData.ehad_ijazat_year, 0, 1)
          : null,
        description: editData.description ?? "",
      };

      console.log("Form data being set:", formData);
      reset(formData);
    }
  }, [editData, reset]);

  const onSubmit = async (data: KarkunFormData) => {
    // Check permissions before submission
    const canCreate =
      isSuperAdmin || hasPermission(PERMISSIONS.CREATE_EHAD_KARKUN);
    const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_EHAD_KARKUN);

    if (editData?.id && !canEdit) {
      showError("You don't have permission to edit ehad karkun.");
      return;
    }

    if (!editData?.id && !canCreate) {
      showError("You don't have permission to create ehad karkun.");
      return;
    }

    const submissionData = {
      ...data,
      zone_id: Number(data.zone_id),
      birth_year: data.birth_year?.getFullYear() || null,
      ehad_year: data.ehad_year?.getFullYear() || null,
      ehad_ijazat_year: data.ehad_ijazat_year?.getFullYear() || null,
    };

    try {
      if (editData?.id) {
        await updateKarkun({ id: editData.id, ...submissionData }).unwrap();
        showSuccess("Karkun updated successfully.");
        onSuccess();
      } else {
        await addKarkun(submissionData).unwrap();
        showSuccess("Karkun added successfully.");
        onSuccess();
      }
    } catch (err: any) {
      showError(err?.data?.message || "Operation failed");
    }
  };

  const inputClass =
    "border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const errorClass = "text-red-500 mt-1 text-sm";
  const datePickerClass = inputClass;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 shadow-md rounded"
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          {editData ? "Edit Ehad Karkun" : "Add New Ehad Karkun"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Zone Select */}
            <div className="flex flex-col">
              <label htmlFor="zone_id" className="mb-1 text-sm text-gray-600">
                Zone:<span className="text-red-500">*</span>
              </label>
              <select
                id="zone_id"
                {...register("zone_id")}
                value={selectedZoneId}
                className={inputClass}
              >
                <option value="">Select Zone</option>
                {ALL_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en} / {zone.title_ur}
                  </option>
                ))}
              </select>
              {errors.zone_id && (
                <small className={errorClass}>{errors.zone_id.message}</small>
              )}
            </div>

            {/* Text Inputs */}
            {[
              { id: "name_en", label: "Name (EN)", required: true },
              { id: "name_ur", label: "Name (UR)", required: true },
              { id: "so_en", label: "S/O (EN)" },
              { id: "so_ur", label: "S/O (UR)" },
              {
                id: "mobile_no",
                label: "Mobile No",
                required: true,
                type: "tel",
                maxLength: 11,
              },
              { id: "cnic", label: "CNIC", type: "text", maxLength: 13 },
            ].map((field) => (
              <div key={field.id} className="flex flex-col">
                <label
                  htmlFor={field.id}
                  className="mb-1 text-sm text-gray-600"
                >
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  id={field.id}
                  type={field.type || "text"}
                  maxLength={field.maxLength}
                  {...register(field.id as keyof KarkunFormData)}
                  className={inputClass}
                  onKeyPress={
                    field.type === "tel"
                      ? (e) => !/[0-9]/.test(e.key) && e.preventDefault()
                      : undefined
                  }
                />
                {errors[field.id as keyof typeof errors] && (
                  <small className={errorClass}>
                    {errors[field.id as keyof typeof errors]?.message}
                  </small>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Address Inputs */}
            {[
              { id: "city_en", label: "City (EN)", required: true },
              { id: "city_ur", label: "City (UR)", required: true },
              { id: "country_en", label: "Country (EN)", required: true },
              { id: "country_ur", label: "Country (UR)", required: true },
            ].map((field) => (
              <div key={field.id} className="flex flex-col">
                <label
                  htmlFor={field.id}
                  className="mb-1 text-sm text-gray-600"
                >
                  {field.label}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id={field.id}
                  type="text"
                  {...register(field.id as keyof KarkunFormData)}
                  className={inputClass}
                />
                {errors[field.id as keyof typeof errors] && (
                  <small className={errorClass}>
                    {errors[field.id as keyof typeof errors]?.message}
                  </small>
                )}
              </div>
            ))}

            {/* Date Pickers */}
            {[
              {
                id: "birth_year",
                label: "Birth Year",
                selected: birthYear,
                maxDate: new Date(),
              },
              { id: "ehad_year", label: "Ehad Year", selected: ehadYear },
              {
                id: "ehad_ijazat_year",
                label: "Ehad Ijazat Year",
                selected: ehadIjazatYear,
              },
            ].map((field) => (
              <div key={field.id} className="flex flex-col">
                <label className="mb-1 text-sm text-gray-600">
                  {field.label}:
                </label>
                <DatePicker
                  selected={field.selected}
                  onChange={(date) =>
                    setValue(field.id as keyof KarkunFormData, date)
                  }
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText={`Select ${field.label}`}
                  className={datePickerClass}
                  maxDate={field.maxDate}
                />
                {errors[field.id as keyof typeof errors] && (
                  <small className={errorClass}>
                    {errors[field.id as keyof typeof errors]?.message}
                  </small>
                )}
              </div>
            ))}

            {/* Description */}
            <div className="flex flex-col">
              <label
                htmlFor="description"
                className="mb-1 text-sm text-gray-600"
              >
                Description:
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className={inputClass}
              />
              {errors.description && (
                <small className={errorClass}>
                  {errors.description.message}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {editData ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
}

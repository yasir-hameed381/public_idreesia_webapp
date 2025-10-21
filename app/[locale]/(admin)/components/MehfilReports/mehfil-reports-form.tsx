"use client";
import type React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useAddMehfilReportMutation,
  useUpdateMehfilReportMutation,
} from "../../../../../store/slicers/mehfilReportsApi";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { MehfilReportFormData } from "../../../../../types/mehfilReports";

const mehfilReportSchema = yup.object().shape({
  report_period: yup.string().required("Report Period is required"),
  zone_id: yup.string().required("Zone is required"),
  mehfil_id: yup.string().required("Mehfil is required"),
  coordinator_name: yup.string().required("Coordinator Name is required"),
  coordinator_attendance_days: yup
    .number()
    .required("Attendance Days is required")
    .min(0, "Must be 0 or greater"),
  total_duty_karkuns: yup
    .number()
    .required("Total Duty Karkuns is required")
    .min(0, "Must be 0 or greater"),
  low_attendance: yup
    .number()
    .required("Low Attendance is required")
    .min(0, "Must be 0 or greater"),
  new_ehads: yup
    .number()
    .required("New Ehads is required")
    .min(0, "Must be 0 or greater"),
  ehad_karkun_name: yup.string().required("Ehad Karkun Name is required"),
  submitted_at: yup.string().required("Submitted Date is required"),
});

export function MehfilReportsForm({
  editData,
  onCancel,
  onSuccess,
}: {
  editData?: MehfilReportFormData | null;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [addReport, { isLoading: isAdding }] = useAddMehfilReportMutation();
  const [updateReport, { isLoading: isUpdating }] =
    useUpdateMehfilReportMutation();
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
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MehfilReportFormData>({
    resolver: yupResolver(mehfilReportSchema),
  });

  const watchedZoneId = watch("zone_id");

  // Filter mehfils based on selected zone
  const filteredMehfils = watchedZoneId
    ? ALL_MEHFILS.filter((mehfil: any) => mehfil.zone_id === watchedZoneId)
    : ALL_MEHFILS;

  useEffect(() => {
    if (editData) {
      // Add a small delay to ensure form is ready
      setTimeout(() => {
        reset({
          report_period: editData.report_period ?? "",
          zone_id: editData.zone_id ?? "",
          mehfil_id: editData.mehfil_id ?? "",
          coordinator_name: editData.coordinator_name ?? "",
          coordinator_attendance_days:
            editData.coordinator_attendance_days ?? 0,
          total_duty_karkuns: editData.total_duty_karkuns ?? 0,
          low_attendance: editData.low_attendance ?? 0,
          new_ehads: editData.new_ehads ?? 0,
          ehad_karkun_name: editData.ehad_karkun_name ?? "",
          submitted_at:
            editData.submitted_at ?? new Date().toISOString().split("T")[0],
        });
      }, 100);
    } else {
      // Set default values for new report
      reset({
        submitted_at: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: MehfilReportFormData) => {
    try {
      const formData = {
        ...data,
        coordinator_attendance_days: parseInt(
          data.coordinator_attendance_days.toString()
        ),
        total_duty_karkuns: parseInt(data.total_duty_karkuns.toString()),
        low_attendance: parseInt(data.low_attendance.toString()),
        new_ehads: parseInt(data.new_ehads.toString()),
      };

      if (editData && editData.id) {
        await updateReport({ id: editData.id, ...formData }).unwrap();
        showSuccess("Report updated successfully!");
      } else {
        await addReport(formData).unwrap();
        showSuccess("Report added successfully!");
      }

      router.push("/mehfil-reports");
    } catch (error) {
      showError(
        `Failed to ${editData ? "update" : "save"} report. Please try again.`
      );
    }
  };

  const isLoading = isAdding || isUpdating;

  if (isLoading) {
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
            onClick={() => router.push("/mehfil-reports")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editData ? "Edit Mehfil Report" : "Create Mehfil Report"}
          </h1>
          <p className="text-gray-600 mt-1">
            {editData
              ? "Update mehfil report information"
              : "Create a new mehfil report"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-8">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Report Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report Period *
                </label>
                <input
                  {...register("report_period")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., June 2025"
                />
                {errors.report_period && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.report_period.message}
                  </p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Zone *
                </label>
                <select
                  {...register("zone_id")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select Zone</option>
                  {ALL_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
                {errors.zone_id && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.zone_id.message}
                  </p>
                )}
              </div>

              {/* Mehfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mehfil *
                </label>
                <select
                  {...register("mehfil_id")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select Mehfil</option>
                  {filteredMehfils.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      {mehfil.address_en}
                    </option>
                  ))}
                </select>
                {errors.mehfil_id && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.mehfil_id.message}
                  </p>
                )}
              </div>

              {/* Coordinator Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Coordinator Name *
                </label>
                <input
                  {...register("coordinator_name")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter coordinator name"
                />
                {errors.coordinator_name && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.coordinator_name.message}
                  </p>
                )}
              </div>

              {/* Coordinator Attendance Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Attendance Days *
                </label>
                <input
                  type="number"
                  {...register("coordinator_attendance_days")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
                {errors.coordinator_attendance_days && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.coordinator_attendance_days.message}
                  </p>
                )}
              </div>

              {/* Total Duty Karkuns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Total Duty Karkuns *
                </label>
                <input
                  type="number"
                  {...register("total_duty_karkuns")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
                {errors.total_duty_karkuns && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.total_duty_karkuns.message}
                  </p>
                )}
              </div>

              {/* Low Attendance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Low Attendance *
                </label>
                <input
                  type="number"
                  {...register("low_attendance")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
                {errors.low_attendance && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.low_attendance.message}
                  </p>
                )}
              </div>

              {/* New Ehads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  New Ehads *
                </label>
                <input
                  type="number"
                  {...register("new_ehads")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  min="0"
                />
                {errors.new_ehads && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.new_ehads.message}
                  </p>
                )}
              </div>

              {/* Ehad Karkun Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ehad Karkun Name *
                </label>
                <input
                  {...register("ehad_karkun_name")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter ehad karkun name"
                />
                {errors.ehad_karkun_name && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.ehad_karkun_name.message}
                  </p>
                )}
              </div>

              {/* Submitted Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Submitted Date *
                </label>
                <input
                  type="date"
                  {...register("submitted_at")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {errors.submitted_at && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.submitted_at.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              {editData ? "Update Report" : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

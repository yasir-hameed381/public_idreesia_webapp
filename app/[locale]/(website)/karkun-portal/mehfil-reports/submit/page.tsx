"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface Zone {
  id: number;
  title_en: string;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en?: string;
  address_en?: string;
}

interface EhadKarkun {
  id: number;
  name: string;
}

interface MehfilReport {
  id?: number;
  report_month: number;
  report_year: number;
  zone_id: number;
  mehfil_directory_id: number;
  ehad_karkun_id?: number | null;
  coordinator_name: string;
  coordinator_monthly_attendance_days: number;
  total_duty_karkuns: number;
  attendance_below_50_percent_karkuns: number;
  consistently_absent_karkuns: number;
  ehad_karkuns_monthly_attendance_days: number;
  new_ehads_in_month: number;
  mehfil_days_in_month: number;
  multan_duty_karkuns: number;
  taleemat_e_karima_read: boolean;
  sawari_and_bhangra_held: boolean;
  daily_karkuns_attendance: number;
  monthly_main_mehfil_karkuns_attendance: number;
  naam_mubarak_meeting_karkuns_attendance: number;
  all_karkuns_meeting_attendance: number;
  mashwara_meeting_date: string;
  mashwara_meeting_participant_karkuns: number;
  monthly_meeting_agenda_details: string;
}

const URDU_MONTHS: Record<number, string> = {
  1: "جنوری",
  2: "فروری",
  3: "مارچ",
  4: "اپریل",
  5: "مئی",
  6: "جون",
  7: "جولائی",
  8: "اگست",
  9: "ستمبر",
  10: "اکتوبر",
  11: "نومبر",
  12: "دسمبر",
};

const MehfilReportFormPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { showError, showSuccess, showInfo } = useToast();

  // State management matching Laravel component
  const [isEdit, setIsEdit] = useState(false);
  const [reportId, setReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Form data matching Laravel fields
  const [formData, setFormData] = useState<MehfilReport>({
    report_month: 0,
    report_year: 0,
    zone_id: 0,
    mehfil_directory_id: 0,
    ehad_karkun_id: null,
    coordinator_name: "",
    coordinator_monthly_attendance_days: 0,
    total_duty_karkuns: 0,
    attendance_below_50_percent_karkuns: 0,
    consistently_absent_karkuns: 0,
    ehad_karkuns_monthly_attendance_days: 0,
    new_ehads_in_month: 0,
    mehfil_days_in_month: 0,
    multan_duty_karkuns: 0,
    taleemat_e_karima_read: false,
    sawari_and_bhangra_held: false,
    daily_karkuns_attendance: 0,
    monthly_main_mehfil_karkuns_attendance: 0,
    naam_mubarak_meeting_karkuns_attendance: 0,
    all_karkuns_meeting_attendance: 0,
    mashwara_meeting_date: "",
    mashwara_meeting_participant_karkuns: 0,
    monthly_meeting_agenda_details: "",
  });

  // Dropdown data
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);
  const [ehadKarkuns, setEhadKarkuns] = useState<EhadKarkun[]>([]);

  // Initialize form with previous month (matching Laravel)
  useEffect(() => {
    if (user) {
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      setFormData((prev) => ({
        ...prev,
        report_month: previousMonth.getMonth() + 1,
        report_year: previousMonth.getFullYear(),
        zone_id: user.zone_id || 0,
        mehfil_directory_id: user.mehfil_directory_id || 0,
      }));

      loadZones();
    }
  }, [user]);

  // Load mehfils when zone changes
  useEffect(() => {
    if (formData.zone_id) {
      loadMehfils();
      loadEhadKarkuns();
    }
  }, [formData.zone_id]);

  // Check for existing report when month/year/mehfil changes
  useEffect(() => {
    if (formData.report_month && formData.report_year && formData.mehfil_directory_id && !isEdit) {
      checkForExistingReport();
    }
  }, [formData.report_month, formData.report_year, formData.mehfil_directory_id]);

  const loadZones = async () => {
    try {
      const response = await apiClient.get("/admin/zones", {
        params: { per_page: 1000 },
      });
      setZones(response.data.data || []);
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  const loadMehfils = async () => {
    if (!formData.zone_id) {
      setMehfilDirectories([]);
      return;
    }

    try {
      const response = await apiClient.get("/mehfil-directory", {
        params: { zoneId: formData.zone_id, size: 1000 },
      });
      const mehfils = (response.data.data || []).sort(
        (a: MehfilDirectory, b: MehfilDirectory) =>
          parseInt(a.mehfil_number) - parseInt(b.mehfil_number)
      );
      setMehfilDirectories(mehfils);
    } catch (error) {
      console.error("Error loading mehfils:", error);
    }
  };

  const loadEhadKarkuns = async () => {
    if (!formData.zone_id) {
      setEhadKarkuns([]);
      return;
    }

    try {
      const response = await apiClient.get("/karkun", {
        params: {
          zone_id: formData.zone_id,
          user_type: "ehad_karkun",
          size: 1000,
        },
      });
      setEhadKarkuns(response.data.data || []);
    } catch (error) {
      console.error("Error loading ehad karkuns:", error);
    }
  };

  // Check for existing report (matching Laravel checkForExistingReport)
  const checkForExistingReport = useCallback(async () => {
    if (!formData.report_month || !formData.report_year || !formData.mehfil_directory_id) {
      return;
    }

    setCheckingExisting(true);
    try {
      const response = await apiClient.get("/mehfil-reports", {
        params: {
          mehfil_directory_id: formData.mehfil_directory_id,
          report_month: formData.report_month,
          report_year: formData.report_year,
          size: 1,
        },
      });

      const existingReport = response.data.data?.[0];
      if (existingReport) {
        setIsEdit(true);
        setReportId(existingReport.id);
        loadReport(existingReport);
        showInfo("Monthly report already submitted for this month.");
      } else {
        setIsEdit(false);
        setReportId(null);
        clearFormData();
      }
    } catch (error) {
      console.error("Error checking for existing report:", error);
    } finally {
      setCheckingExisting(false);
    }
  }, [formData.report_month, formData.report_year, formData.mehfil_directory_id, showInfo]);

  // Load existing report data (matching Laravel loadReport)
  const loadReport = (report: any) => {
    setFormData({
      report_month: report.report_month || formData.report_month,
      report_year: report.report_year || formData.report_year,
      zone_id: report.zone_id || formData.zone_id,
      mehfil_directory_id: report.mehfil_directory_id || formData.mehfil_directory_id,
      ehad_karkun_id: report.ehad_karkun_id || null,
      coordinator_name: report.coordinator_name || "",
      coordinator_monthly_attendance_days: report.coordinator_monthly_attendance_days || 0,
      total_duty_karkuns: report.total_duty_karkuns || 0,
      attendance_below_50_percent_karkuns: report.attendance_below_50_percent_karkuns || 0,
      consistently_absent_karkuns: report.consistently_absent_karkuns || 0,
      ehad_karkuns_monthly_attendance_days: report.ehad_karkuns_monthly_attendance_days || 0,
      new_ehads_in_month: report.new_ehads_in_month || 0,
      mehfil_days_in_month: report.mehfil_days_in_month || 0,
      multan_duty_karkuns: report.multan_duty_karkuns || 0,
      taleemat_e_karima_read: report.taleemat_e_karima_read || false,
      sawari_and_bhangra_held: report.sawari_and_bhangra_held || false,
      daily_karkuns_attendance: report.daily_karkuns_attendance || 0,
      monthly_main_mehfil_karkuns_attendance: report.monthly_main_mehfil_karkuns_attendance || 0,
      naam_mubarak_meeting_karkuns_attendance: report.naam_mubarak_meeting_karkuns_attendance || 0,
      all_karkuns_meeting_attendance: report.all_karkuns_meeting_attendance || 0,
      mashwara_meeting_date: report.mashwara_meeting_date
        ? new Date(report.mashwara_meeting_date).toISOString().split("T")[0]
        : "",
      mashwara_meeting_participant_karkuns: report.mashwara_meeting_participant_karkuns || 0,
      monthly_meeting_agenda_details: report.monthly_meeting_agenda_details || "",
    });
  };

  // Clear form data (matching Laravel clearFormData)
  const clearFormData = () => {
    setFormData((prev) => ({
      ...prev,
      ehad_karkun_id: null,
      coordinator_name: "",
      coordinator_monthly_attendance_days: 0,
      total_duty_karkuns: 0,
      attendance_below_50_percent_karkuns: 0,
      consistently_absent_karkuns: 0,
      ehad_karkuns_monthly_attendance_days: 0,
      new_ehads_in_month: 0,
      mehfil_days_in_month: 0,
      multan_duty_karkuns: 0,
      taleemat_e_karima_read: false,
      sawari_and_bhangra_held: false,
      daily_karkuns_attendance: 0,
      monthly_main_mehfil_karkuns_attendance: 0,
      naam_mubarak_meeting_karkuns_attendance: 0,
      all_karkuns_meeting_attendance: 0,
      mashwara_meeting_date: "",
      mashwara_meeting_participant_karkuns: 0,
      monthly_meeting_agenda_details: "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (matching Laravel rules)
    if (!formData.report_month || !formData.report_year) {
      showError("Please select month and year");
      return;
    }
    if (!formData.zone_id) {
      showError("Zone is required");
      return;
    }
    if (!formData.mehfil_directory_id) {
      showError("Mehfil is required");
      return;
    }
    if (!formData.coordinator_name) {
      showError("Coordinator name is required");
      return;
    }
    if (!formData.mashwara_meeting_date) {
      showError("Mashwara meeting date is required");
      return;
    }
    if (!formData.monthly_meeting_agenda_details) {
      showError("Monthly meeting agenda details is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        report_month: formData.report_month,
        report_year: formData.report_year,
        zone_id: formData.zone_id,
        mehfil_directory_id: formData.mehfil_directory_id,
        ehad_karkun_id: formData.ehad_karkun_id,
        coordinator_name: formData.coordinator_name,
        coordinator_monthly_attendance_days: formData.coordinator_monthly_attendance_days,
        total_duty_karkuns: formData.total_duty_karkuns,
        attendance_below_50_percent_karkuns: formData.attendance_below_50_percent_karkuns,
        consistently_absent_karkuns: formData.consistently_absent_karkuns,
        ehad_karkuns_monthly_attendance_days: formData.ehad_karkuns_monthly_attendance_days,
        new_ehads_in_month: formData.new_ehads_in_month,
        mehfil_days_in_month: formData.mehfil_days_in_month,
        multan_duty_karkuns: formData.multan_duty_karkuns,
        taleemat_e_karima_read: formData.taleemat_e_karima_read ? 1 : 0,
        sawari_and_bhangra_held: formData.sawari_and_bhangra_held ? 1 : 0,
        daily_karkuns_attendance: formData.daily_karkuns_attendance,
        monthly_main_mehfil_karkuns_attendance: formData.monthly_main_mehfil_karkuns_attendance,
        naam_mubarak_meeting_karkuns_attendance: formData.naam_mubarak_meeting_karkuns_attendance,
        all_karkuns_meeting_attendance: formData.all_karkuns_meeting_attendance,
        mashwara_meeting_date: formData.mashwara_meeting_date,
        mashwara_meeting_participant_karkuns: formData.mashwara_meeting_participant_karkuns,
        monthly_meeting_agenda_details: formData.monthly_meeting_agenda_details,
      };

      if (isEdit && reportId) {
        const url = `/mehfil-reports/update/${reportId}`;
        await apiClient.put(url, payload);
        showSuccess("Mehfil report updated successfully.");
      } else {
        const url = "/mehfil-reports/add";
        await apiClient.post(url, payload);
        showSuccess("Mehfil report submitted successfully.");
      }

      router.push("/karkun-portal/mehfil-reports");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Error submitting mehfil report. Please try again.";

      if (error.response?.status === 404) {
        showError(`API endpoint not found (404). Please ensure your backend server is running on ${API_URL}`);
      } else if (error.response?.status === 401) {
        showError("Authentication failed. Please log in again.");
      } else if (error.code === 'ERR_NETWORK') {
        showError(`Cannot connect to backend server at ${API_URL}. Please ensure it's running.`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate years array (current year - 2 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/karkun-portal/mehfil-reports"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Mehfil Report" : "Submit Mehfil Report"}
          </h1>
          {checkingExisting && (
            <div className="mt-2 flex items-center gap-2 text-blue-600">
              <AlertCircle size={16} />
              <span className="text-sm">Checking for existing report...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          {/* Month, Year, Zone, Mehfil Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="report_month"
                value={formData.report_month}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select Month</option>
                {Object.entries(URDU_MONTHS).map(([num, name]) => (
                  <option key={num} value={num}>
                    {name} ({num})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="report_year"
                value={formData.report_year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mehfil <span className="text-red-500">*</span>
              </label>
              <select
                name="mehfil_directory_id"
                value={formData.mehfil_directory_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.zone_id}
                required
              >
                <option value={0}>Select Mehfil</option>
                {mehfilDirectories.map((mehfil) => (
                  <option key={mehfil.id} value={mehfil.id}>
                    #{mehfil.mehfil_number} - {mehfil.name_en || mehfil.address_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ehad Karkun Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ehad Karkun
            </label>
            <select
              name="ehad_karkun_id"
              value={formData.ehad_karkun_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Ehad Karkun (Optional)</option>
              {ehadKarkuns.map((karkun) => (
                <option key={karkun.id} value={karkun.id}>
                  {karkun.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinator Information */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Coordinator Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coordinator Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="coordinator_name"
                  value={formData.coordinator_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coordinator Monthly Attendance Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="coordinator_monthly_attendance_days"
                  value={formData.coordinator_monthly_attendance_days}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Karkun Statistics */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Karkun Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Duty Karkuns <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_duty_karkuns"
                  value={formData.total_duty_karkuns}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Below 50% Karkuns <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="attendance_below_50_percent_karkuns"
                  value={formData.attendance_below_50_percent_karkuns}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consistently Absent Karkuns <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="consistently_absent_karkuns"
                  value={formData.consistently_absent_karkuns}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ehad Karkuns Monthly Attendance Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="ehad_karkuns_monthly_attendance_days"
                  value={formData.ehad_karkuns_monthly_attendance_days}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Ehads in Month <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="new_ehads_in_month"
                  value={formData.new_ehads_in_month}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil Days in Month <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="mehfil_days_in_month"
                  value={formData.mehfil_days_in_month}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multan Duty Karkuns <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="multan_duty_karkuns"
                  value={formData.multan_duty_karkuns}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="taleemat_e_karima_read"
                  checked={formData.taleemat_e_karima_read}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Taleemat-e-Karima Read
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="sawari_and_bhangra_held"
                  checked={formData.sawari_and_bhangra_held}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Sawari and Bhangra Held
                </span>
              </label>
            </div>
          </div>

          {/* Attendance Information */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Attendance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Karkuns Attendance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="daily_karkuns_attendance"
                  value={formData.daily_karkuns_attendance}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Main Mehfil Karkuns Attendance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthly_main_mehfil_karkuns_attendance"
                  value={formData.monthly_main_mehfil_karkuns_attendance}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam Mubarak Meeting Karkuns Attendance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="naam_mubarak_meeting_karkuns_attendance"
                  value={formData.naam_mubarak_meeting_karkuns_attendance}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  All Karkuns Meeting Attendance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="all_karkuns_meeting_attendance"
                  value={formData.all_karkuns_meeting_attendance}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mashwara Meeting */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Mashwara Meeting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mashwara Meeting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="mashwara_meeting_date"
                  value={formData.mashwara_meeting_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mashwara Meeting Participant Karkuns <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="mashwara_meeting_participant_karkuns"
                  value={formData.mashwara_meeting_participant_karkuns}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Meeting Agenda Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="monthly_meeting_agenda_details"
                value={formData.monthly_meeting_agenda_details}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter monthly meeting agenda details..."
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="border-t pt-6 flex justify-end gap-4">
            <Link
              href="/karkun-portal/mehfil-reports"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Report"
                  : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MehfilReportFormPage;

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import { Khat, MehfilSummary, ZoneSummary } from "@/types/khat";
import { useAuth } from "@/hooks/useAuth";

type Variant = "admin" | "karkun";

const MISSED_PRAYER_OPTIONS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const KHAT_TYPES = [
  { value: "khat", label: "Khat" },
  { value: "masail", label: "Masail" },
];

interface KhatFormProps {
  variant?: Variant;
  redirectPath?: string;
  defaultType?: "khat" | "masail";
}

type Booleanish = boolean;

interface FormState {
  description: string;
  kalimah_quantity: string;
  ayat_ul_kursi_quantity: string;
  astagfirullah_quantity: string;
  allah_quantity: string;
  dua_e_talluq_quantity: string;
  laa_ilaaha_illallah_quantity: string;
  sallallahu_alayhi_wasallam_quantity: string;
  dua_e_waswasey_quantity: string;
  additional_wazaif_reading: string;
  consistent_in_wazaif: Booleanish;
  consistent_in_prayers: Booleanish;
  consistent_in_ishraq: Booleanish;
  makes_up_missed_prayers: Booleanish;
  missed_prayers: string[];
  can_read_quran: Booleanish;
  multan_visit_frequency: string;
  mehfil_attendance_frequency: string;
  is_submitted_before: Booleanish;
  last_submission_wazaifs: string;
  full_name: string;
  father_name: string;
  email: string;
  phone_number: string;
  age: string;
  city: string;
  ehad_duration: string;
  introducer_name: string;
  address: string;
  zone_id: number | null;
  mehfil_directory_id: number | null;
  last_tarteeb: string;
  reciter_missed_prayers: string[];
  reciter_relation: string;
  reciter_name: string;
  reciter_age: string;
  reciter_ehad_duration: string;
  reciter_consistent_in_wazaif: Booleanish;
  reciter_consistent_in_prayers: Booleanish;
  reciter_makes_up_missed_prayers: Booleanish;
  reciter_can_read_quran: Booleanish;
  reciter_multan_visit_frequency: string;
  reciter_mehfil_attendance_frequency: string;
  type: "khat" | "masail";
}

const defaultFormState: FormState = {
  description: "",
  kalimah_quantity: "",
  ayat_ul_kursi_quantity: "",
  astagfirullah_quantity: "",
  allah_quantity: "",
  dua_e_talluq_quantity: "",
  laa_ilaaha_illallah_quantity: "",
  sallallahu_alayhi_wasallam_quantity: "",
  dua_e_waswasey_quantity: "",
  additional_wazaif_reading: "",
  consistent_in_wazaif: false,
  consistent_in_prayers: false,
  consistent_in_ishraq: false,
  makes_up_missed_prayers: false,
  missed_prayers: [],
  can_read_quran: false,
  multan_visit_frequency: "",
  mehfil_attendance_frequency: "",
  is_submitted_before: false,
  last_submission_wazaifs: "",
  full_name: "",
  father_name: "",
  email: "",
  phone_number: "",
  age: "",
  city: "",
  ehad_duration: "",
  introducer_name: "",
  address: "",
  zone_id: null,
  mehfil_directory_id: null,
  last_tarteeb: "",
  reciter_missed_prayers: [],
  reciter_relation: "",
  reciter_name: "",
  reciter_age: "",
  reciter_ehad_duration: "",
  reciter_consistent_in_wazaif: false,
  reciter_consistent_in_prayers: false,
  reciter_makes_up_missed_prayers: false,
  reciter_can_read_quran: false,
  reciter_multan_visit_frequency: "",
  reciter_mehfil_attendance_frequency: "",
  type: "masail",
};

const numberOrNull = (value: string) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const KhatForm: React.FC<KhatFormProps> = ({ variant = "admin", redirectPath, defaultType }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    ...defaultFormState,
    type: defaultType ?? (variant === "karkun" ? "masail" : "khat"),
    zone_id: variant === "karkun" ? user?.zone_id ?? null : null,
    mehfil_directory_id: variant === "karkun" ? user?.mehfil_directory_id ?? null : null,
  });
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [mehfils, setMehfils] = useState<MehfilSummary[]>([]);
  const [loadingMehfils, setLoadingMehfils] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSelectZone = useMemo(() => {
    if (variant === "admin") return true;
    return Boolean(user?.is_all_region_admin || user?.is_region_admin);
  }, [variant, user]);

  const canSelectMehfil = useMemo(() => {
    if (variant === "admin") return true;
    return Boolean(
      user?.is_all_region_admin || user?.is_region_admin || user?.is_zone_admin || user?.is_mehfil_admin
    );
  }, [variant, user]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const list = await KhatService.getZones(500);
        setZones(list);
      } catch (error) {
        console.error("Failed to load zones", error);
        toast.error("Unable to load zones");
      }
    };

    loadZones();
  }, []);

  useEffect(() => {
    const zoneId = form.zone_id;
    if (!zoneId) {
      setMehfils([]);
      return;
    }

    const loadMehfils = async () => {
      setLoadingMehfils(true);
      try {
        const list = await KhatService.getMehfilsByZone(zoneId, 500);
        setMehfils(list);
      } catch (error) {
        console.error("Failed to load mehfils", error);
        toast.error("Unable to load mehfils");
      } finally {
        setLoadingMehfils(false);
      }
    };

    loadMehfils();
  }, [form.zone_id]);

  const handleChange = useCallback((field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayValue = useCallback((field: "missed_prayers" | "reciter_missed_prayers", value: string) => {
    setForm((prev) => {
      const current = prev[field];
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.full_name || !form.phone_number) {
      toast.error("Full name and phone number are required");
      return;
    }

    if (!form.zone_id) {
      toast.error("Please select a zone");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Khat> = {
        description: form.description,
        kalimah_quantity: numberOrNull(form.kalimah_quantity) ?? 0,
        ayat_ul_kursi_quantity: numberOrNull(form.ayat_ul_kursi_quantity) ?? 0,
        astagfirullah_quantity: numberOrNull(form.astagfirullah_quantity) ?? 0,
        allah_quantity: numberOrNull(form.allah_quantity) ?? 0,
        dua_e_talluq_quantity: numberOrNull(form.dua_e_talluq_quantity) ?? 0,
        laa_ilaaha_illallah_quantity: numberOrNull(form.laa_ilaaha_illallah_quantity) ?? 0,
        sallallahu_alayhi_wasallam_quantity: numberOrNull(form.sallallahu_alayhi_wasallam_quantity) ?? 0,
        dua_e_waswasey_quantity: numberOrNull(form.dua_e_waswasey_quantity) ?? 0,
        additional_wazaif_reading: form.additional_wazaif_reading || null,
        consistent_in_wazaif: form.consistent_in_wazaif,
        consistent_in_prayers: form.consistent_in_prayers,
        consistent_in_ishraq: form.consistent_in_ishraq,
        makes_up_missed_prayers: form.makes_up_missed_prayers,
        missed_prayers: form.makes_up_missed_prayers ? form.missed_prayers : [],
        can_read_quran: form.can_read_quran,
        multan_visit_frequency: form.multan_visit_frequency,
        mehfil_attendance_frequency: form.mehfil_attendance_frequency,
        is_submitted_before: form.is_submitted_before,
        last_submission_wazaifs: form.is_submitted_before ? form.last_submission_wazaifs : null,
        full_name: form.full_name,
        father_name: form.father_name,
        email: form.email || null,
        phone_number: form.phone_number,
        age: numberOrNull(form.age),
        city: form.city,
        ehad_duration: form.ehad_duration,
        introducer_name: form.introducer_name || null,
        address: form.address || null,
        zone_id: form.zone_id ?? undefined,
        mehfil_directory_id: form.mehfil_directory_id || null,
        last_tarteeb: form.last_tarteeb || null,
        consistent_in_ishraq: form.consistent_in_ishraq,
        reciter_relation: form.reciter_relation || null,
        reciter_name: form.reciter_name || null,
        reciter_age: numberOrNull(form.reciter_age),
        reciter_ehad_duration: form.reciter_ehad_duration || null,
        reciter_consistent_in_wazaif: form.reciter_consistent_in_wazaif,
        reciter_consistent_in_prayers: form.reciter_consistent_in_prayers,
        reciter_makes_up_missed_prayers: form.reciter_makes_up_missed_prayers,
        reciter_missed_prayers: form.reciter_makes_up_missed_prayers ? form.reciter_missed_prayers : [],
        reciter_can_read_quran: form.reciter_can_read_quran,
        reciter_multan_visit_frequency: form.reciter_multan_visit_frequency || null,
        reciter_mehfil_attendance_frequency: form.reciter_mehfil_attendance_frequency || null,
        type: form.type,
        status: "pending",
        created_by: user?.id,
      };

      const response = await KhatService.createKhat(payload);
      toast.success("Submission recorded successfully");
      setForm({
        ...defaultFormState,
        type: form.type,
        zone_id: form.zone_id,
        mehfil_directory_id: form.mehfil_directory_id,
      });
      router.push(redirectPath ?? (variant === "admin" ? "/admin/khatoot" : "/karkun-portal/khatoot"));
      return response;
    } catch (error: any) {
      console.error("Failed to submit khat", error);
      toast.error(error?.response?.data?.message || "Unable to submit khat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Submission Details</h2>
          <p className="text-sm text-gray-500">Describe the khat/masail and related wazaif.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
            rows={6}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { field: "kalimah_quantity", label: "Kalimah" },
            { field: "allah_quantity", label: "Allah" },
            { field: "laa_ilaaha_illallah_quantity", label: "Laa Ilaaha Illallah" },
            { field: "sallallahu_alayhi_wasallam_quantity", label: "Sallallahu Alayhi Wasallam" },
            { field: "astagfirullah_quantity", label: "Astagfirullah" },
            { field: "ayat_ul_kursi_quantity", label: "Ayat ul Kursi" },
            { field: "dua_e_talluq_quantity", label: "Dua e Talluq" },
            { field: "dua_e_waswasey_quantity", label: "Dua e Waswasey" },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                value={form[field as keyof FormState] as string}
                onChange={(e) => handleChange(field as keyof FormState, e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Wazaif</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
            rows={3}
            value={form.additional_wazaif_reading}
            onChange={(e) => handleChange("additional_wazaif_reading", e.target.value)}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Religious Practice</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.can_read_quran}
                onChange={(e) => handleChange("can_read_quran", e.target.checked)}
              />
              <span className="text-sm text-gray-700">Can read Quran *</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.consistent_in_wazaif}
                onChange={(e) => handleChange("consistent_in_wazaif", e.target.checked)}
              />
              <span className="text-sm text-gray-700">Consistent in wazaif *</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.consistent_in_prayers}
                onChange={(e) => handleChange("consistent_in_prayers", e.target.checked)}
              />
              <span className="text-sm text-gray-700">Consistent in prayers *</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.makes_up_missed_prayers}
                onChange={(e) => handleChange("makes_up_missed_prayers", e.target.checked)}
              />
              <span className="text-sm text-gray-700">Makes up missed prayers *</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Attendance Metrics</label>
            <input
              type="text"
              placeholder="Multan visit frequency"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.multan_visit_frequency}
              onChange={(e) => handleChange("multan_visit_frequency", e.target.value)}
              required
            />
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.mehfil_attendance_frequency}
              onChange={(e) => handleChange("mehfil_attendance_frequency", e.target.value)}
              required
            >
              <option value="">Select mehfil attendance</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {form.makes_up_missed_prayers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Missed Prayers *</label>
            <div className="flex flex-wrap gap-3">
              {MISSED_PRAYER_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                  <input
                    type="checkbox"
                    checked={form.missed_prayers.includes(option)}
                    onChange={() => toggleArrayValue("missed_prayers", option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Previous Submission</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_submitted_before}
              onChange={(e) => handleChange("is_submitted_before", e.target.checked)}
            />
            <span className="text-sm text-gray-700">Submitted before</span>
          </div>
          {form.is_submitted_before && (
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              rows={2}
              placeholder="Last submission wazaif"
              value={form.last_submission_wazaifs}
              onChange={(e) => handleChange("last_submission_wazaifs", e.target.value)}
            />
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Applicant Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              disabled={variant === "karkun"}
            >
              {KHAT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.father_name}
              onChange={(e) => handleChange("father_name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ehad Duration *</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.ehad_duration}
              onChange={(e) => handleChange("ehad_duration", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Tarteeb</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.last_tarteeb}
              onChange={(e) => handleChange("last_tarteeb", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Introducer Name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.introducer_name}
              onChange={(e) => handleChange("introducer_name", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
            rows={2}
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reciter Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.reciter_relation}
              onChange={(e) => handleChange("reciter_relation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.reciter_name}
              onChange={(e) => handleChange("reciter_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.reciter_age}
              onChange={(e) => handleChange("reciter_age", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ehad Duration</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
              value={form.reciter_ehad_duration}
              onChange={(e) => handleChange("reciter_ehad_duration", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: "reciter_consistent_in_wazaif", label: "Consistent in wazaif" },
            { field: "reciter_consistent_in_prayers", label: "Consistent in prayers" },
            { field: "reciter_makes_up_missed_prayers", label: "Makes up missed prayers" },
            { field: "reciter_can_read_quran", label: "Can read Quran" },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form[field as keyof FormState] as boolean}
                onChange={(e) => handleChange(field as keyof FormState, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        {form.reciter_makes_up_missed_prayers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reciter Missed Prayers</label>
            <div className="flex flex-wrap gap-3">
              {MISSED_PRAYER_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                  <input
                    type="checkbox"
                    checked={form.reciter_missed_prayers.includes(option)}
                    onChange={() => toggleArrayValue("reciter_missed_prayers", option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Reciter Multan visit frequency"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
            value={form.reciter_multan_visit_frequency}
            onChange={(e) => handleChange("reciter_multan_visit_frequency", e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
            value={form.reciter_mehfil_attendance_frequency}
            onChange={(e) => handleChange("reciter_mehfil_attendance_frequency", e.target.value)}
          >
            <option value="">Reciter mehfil attendance</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Assignment</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
              value={form.zone_id ?? ""}
              onChange={(e) => handleChange("zone_id", e.target.value ? Number(e.target.value) : null)}
              disabled={!canSelectZone}
              required
            >
              <option value="">Select zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.title_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mehfil</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
              value={form.mehfil_directory_id ?? ""}
              onChange={(e) =>
                handleChange("mehfil_directory_id", e.target.value ? Number(e.target.value) : null)
              }
              disabled={!canSelectMehfil || !form.zone_id || loadingMehfils}
            >
              <option value="">Select mehfil</option>
              {mehfils.map((mehfil) => (
                <option key={mehfil.id} value={mehfil.id}>
                  #{mehfil.mehfil_number} - {mehfil.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(redirectPath ?? (variant === "admin" ? "/admin/khatoot" : "/karkun-portal/khatoot"))}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-green-300"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default KhatForm;



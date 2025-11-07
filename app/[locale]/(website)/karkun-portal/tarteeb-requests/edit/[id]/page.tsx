"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";

interface Zone {
  id: number;
  title_en: string;
  city_en?: string;
  country_en?: string;
}

interface Mehfil {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en?: string;
}

const EditTarteebRequestPage = () => {
  const router = useRouter();
  const params = useParams();
  const requestId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    if (Array.isArray(idParam)) {
      return parseInt(idParam[0], 10);
    }
    return parseInt(idParam, 10);
  }, [params]);

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);
  const [mehfilCache, setMehfilCache] = useState<Record<number, Mehfil[]>>({});

  const [formData, setFormData] = useState<Partial<TarteebRequest>>({});

  const canManageZones = useMemo(
    () =>
      Boolean(
        user?.is_super_admin || user?.is_region_admin || user?.is_all_region_admin
      ),
    [user?.is_all_region_admin, user?.is_region_admin, user?.is_super_admin]
  );

  const canSelectMehfils = useMemo(
    () =>
      Boolean(
        canManageZones || user?.is_zone_admin || user?.is_mehfil_admin
      ),
    [canManageZones, user?.is_mehfil_admin, user?.is_zone_admin]
  );

  const prayerOptions = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!requestId) {
        toast.error("Invalid request id");
        router.replace("/karkun-portal/tarteeb-requests");
        return;
      }

      try {
        setLoading(true);
        const request = await TarteebRequestService.getTarteebRequestById(
          requestId
        );

        const normalized: Partial<TarteebRequest> = {
          ...request,
          consistent_in_prayers: Boolean(request.consistent_in_prayers),
          consistent_in_wazaif: Boolean(request.consistent_in_wazaif),
          makes_up_missed_prayers: Boolean(request.makes_up_missed_prayers),
          can_read_quran: Boolean(request.can_read_quran),
          consistent_in_ishraq: Boolean(request.consistent_in_ishraq),
          consistent_in_tahajjud: Boolean(request.consistent_in_tahajjud),
          listens_taleem_daily: Boolean(request.listens_taleem_daily),
          reads_current_wazaif_with_ease: Boolean(
            request.reads_current_wazaif_with_ease
          ),
          able_to_read_additional_wazaif: Boolean(
            request.able_to_read_additional_wazaif
          ),
          does_dum_taweez: Boolean(request.does_dum_taweez),
          missed_prayers: Array.isArray(request.missed_prayers)
            ? request.missed_prayers
            : [],
        };

        setFormData(normalized);

        if (canManageZones) {
          const zoneList = await TarteebRequestService.getZones(200);
          setZones(zoneList);
        } else if (request.zone_id) {
          if (user?.zone) {
            const zone = user.zone as Partial<Zone>;
            setZones([
              {
                id: request.zone_id,
                title_en: zone?.title_en || "Your Zone",
                city_en: zone?.city_en,
                country_en: zone?.country_en,
              },
            ]);
          } else {
            setZones([
              {
                id: request.zone_id,
                title_en: "Your Zone",
              },
            ]);
          }
        }

        if (request.zone_id) {
          const mehfilList = await TarteebRequestService.getMehfilsByZone(
            request.zone_id,
            500
          );
          setMehfils(mehfilList);
          setMehfilCache((prev) => ({
            ...prev,
            [request.zone_id!]: mehfilList,
          }));
        }
      } catch (error) {
        console.error("Failed to load tarteeb request", error);
        toast.error("Failed to load tarteeb request");
        router.replace("/karkun-portal/tarteeb-requests");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [canManageZones, requestId, router, user?.zone]);

  useEffect(() => {
    const fetchZones = async () => {
      if (!canManageZones) {
        return;
      }

      try {
        const zoneList = await TarteebRequestService.getZones(200);
        setZones(zoneList);
      } catch (error) {
        console.error("Failed to load zones", error);
        toast.error("Failed to load zones");
      }
    };

    fetchZones();
  }, [canManageZones]);

  useEffect(() => {
    const zoneId = formData.zone_id;

    if (!zoneId) {
      setMehfils([]);
      return;
    }

    if (mehfilCache[zoneId]) {
      setMehfils(mehfilCache[zoneId]);
      return;
    }

    const fetchMehfils = async () => {
      try {
        const mehfilList = await TarteebRequestService.getMehfilsByZone(
          zoneId,
          500
        );
        setMehfils(mehfilList);
        setMehfilCache((prev) => ({
          ...prev,
          [zoneId]: mehfilList,
        }));
      } catch (error) {
        console.error("Failed to load mehfils", error);
        toast.error("Failed to load mehfils");
      }
    };

    fetchMehfils();
  }, [formData.zone_id, mehfilCache]);

  const updateFormData = (field: keyof TarteebRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof TarteebRequest, value: boolean) => {
    updateFormData(field, value);
  };

  const handleMissedPrayersChange = (prayer: string, checked: boolean) => {
    const currentPrayers = Array.isArray(formData.missed_prayers)
      ? formData.missed_prayers
      : [];
    if (checked) {
      updateFormData("missed_prayers", [...currentPrayers, prayer]);
    } else {
      updateFormData(
        "missed_prayers",
        currentPrayers.filter((p) => p !== prayer)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestId) {
      toast.error("Invalid request id");
      return;
    }

    if (!formData.zone_id || !formData.mehfil_directory_id) {
      toast.error("Please select zone and mehfil");
      return;
    }

    try {
      setSaving(true);
      await TarteebRequestService.updateTarteebRequest(requestId, {
        ...formData,
      });
      toast.success("Tarteeb request updated successfully");
      router.push("/karkun-portal/tarteeb-requests");
    } catch (error: any) {
      console.error("Failed to update request", error);
      toast.error(
        error?.response?.data?.message || "Failed to update tarteeb request"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!requestId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-green-600 hover:text-green-800"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Tarteeb Request
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.zone_id || ""}
                      onChange={(e) => {
                        const zoneId = e.target.value
                          ? Number(e.target.value)
                          : 0;
                        updateFormData(
                          "zone_id",
                          zoneId > 0 ? zoneId : undefined
                        );
                        updateFormData("mehfil_directory_id", undefined);
                      }}
                      disabled={!canManageZones}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        !canManageZones
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">Select Zone</option>
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
                      value={formData.mehfil_directory_id || ""}
                      onChange={(e) => {
                        const mehfilId = e.target.value
                          ? Number(e.target.value)
                          : 0;
                        updateFormData(
                          "mehfil_directory_id",
                          mehfilId > 0 ? mehfilId : undefined
                        );
                      }}
                      disabled={!canSelectMehfils || !formData.zone_id}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        !canSelectMehfils || !formData.zone_id
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">Select Mehfil</option>
                      {mehfils.map((mehfil) => (
                        <option key={mehfil.id} value={mehfil.id}>
                          #{mehfil.mehfil_number} - {mehfil.name_en}
                        </option>
                      ))}
                    </select>
                    {!mehfils.length && formData.zone_id ? (
                      <p className="mt-1 text-xs text-gray-500">
                        No mehfils found for the selected zone.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      ["full_name", "Full Name"],
                      ["father_name", "Father's Name"],
                      ["email", "Email"],
                      ["phone_number", "Phone Number"],
                      ["city", "City"],
                      ["country", "Country"],
                      ["education", "Education"],
                      ["source_of_income", "Source of Income"],
                      ["introducer_name", "Introducer Name"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        required
                        value={(formData[field] as string) || ""}
                        onChange={(e) => updateFormData(field, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      required
                      value={formData.age ?? ""}
                      onChange={(e) => updateFormData("age", Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.gender || "male"}
                      onChange={(e) =>
                        updateFormData("gender", e.target.value as "male" | "female")
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.marital_status || "single"}
                      onChange={(e) =>
                        updateFormData(
                          "marital_status",
                          e.target.value as TarteebRequest["marital_status"]
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Religious Practices
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.consistent_in_prayers)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "consistent_in_prayers",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Are you consistent in your five daily prayers?
                      </span>
                    </label>

                    {!formData.consistent_in_prayers && (
                      <div className="ml-6 space-y-2">
                        <p className="text-sm text-gray-600 mb-2">
                          Which prayers do you miss?
                        </p>
                        {prayerOptions.map((prayer) => (
                          <label key={prayer} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                Array.isArray(formData.missed_prayers) &&
                                formData.missed_prayers.includes(prayer)
                              }
                              onChange={(e) =>
                                handleMissedPrayersChange(prayer, e.target.checked)
                              }
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {prayer}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {(
                    [
                      ["makes_up_missed_prayers", "Do you make up for missed prayers (Qaza)?"],
                      ["consistent_in_ishraq", "Are you consistent in Ishraq prayer?"],
                      ["consistent_in_tahajjud", "Are you consistent in Tahajjud prayer?"],
                      ["can_read_quran", "Can you read the Quran?"],
                      ["listens_taleem_daily", "Do you listen to daily Taleem?"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[field])}
                        onChange={(e) =>
                          handleCheckboxChange(field, e.target.checked)
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {label}
                      </span>
                    </label>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Nawafil (voluntary prayers) daily
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.nawafil ?? ""}
                      onChange={(e) => updateFormData("nawafil", Number(e.target.value))}
                      className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily amount of Durood Sharif
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.amount_of_durood ?? ""}
                      onChange={(e) =>
                        updateFormData("amount_of_durood", Number(e.target.value))
                      }
                      className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Wazaif Information
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.consistent_in_wazaif)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "consistent_in_wazaif",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Are you consistent in your wazaif?
                    </span>
                  </label>

                  {(
                    [
                      ["last_wazaif_tarteeb", "Last Wazaif Tarteeb Received"],
                      [
                        "wazaif_consistency_duration",
                        "How long have you been consistent with current wazaif?",
                      ],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={(formData[field] as string) || ""}
                        onChange={(e) => updateFormData(field, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                      />
                    </div>
                  ))}

                  {(
                    [
                      ["reads_current_wazaif_with_ease", "Can you read current wazaif with ease?"],
                      ["able_to_read_additional_wazaif", "Are you able to read additional wazaif?"],
                      ["does_dum_taweez", "Do you practice Dum/Taweez?"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[field])}
                        onChange={(e) =>
                          handleCheckboxChange(field, e.target.checked)
                        }
                        className="h-4 w-4 text-green-600 focus-ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">
                    Current Daily Wazaif Quantities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(
                      [
                        ["kalimah_quantity", "Kalimah"],
                        ["allah_quantity", "Allah (لفظ اللہ)"],
                        [
                          "laa_ilaaha_illallah_quantity",
                          "Laa Ilaaha Illallah",
                        ],
                        [
                          "sallallahu_alayhi_wasallam_quantity",
                          "Sallallahu Alayhi Wasallam",
                        ],
                        ["astagfirullah_quantity", "Astagfirullah"],
                        ["ayat_ul_kursi_quantity", "Ayat-ul-Kursi"],
                        ["dua_e_talluq_quantity", "Dua-e-Talluq"],
                        ["subhanallah_quantity", "Subhanallah"],
                        ["dua_e_waswasey_quantity", "Dua-e-Waswasey"],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-sm text-gray-700 mb-1">
                          {label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={(formData[field] as number | undefined) ?? ""}
                          onChange={(e) =>
                            updateFormData(field, Number(e.target.value))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>

                <div className="space-y-4">
                  {(
                    [
                      ["ehad_duration", "Ehad Duration"],
                      ["multan_visit_frequency", "Multan Visit Frequency"],
                      [
                        "mehfil_attendance_frequency",
                        "Mehfil Attendance Frequency",
                      ],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={(formData[field] as string) || ""}
                        onChange={(e) => updateFormData(field, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Household Members in Ehad
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.household_members_in_ehad ?? ""}
                      onChange={(e) =>
                        updateFormData(
                          "household_members_in_ehad",
                          Number(e.target.value)
                        )
                      }
                      className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>

                  {(
                    [
                      ["other_wazaif", "Other Wazaif You Read"],
                      [
                        "wazaif_not_reading",
                        "Wazaif You Are Not Reading (from your tarteeb)",
                      ],
                      [
                        "additional_wazaif_reading",
                        "Additional Wazaif You Would Like to Read",
                      ],
                      ["issues_facing", "Issues or Difficulties You Are Facing"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={(formData[field] as string) || ""}
                        onChange={(e) => updateFormData(field, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawab (optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.jawab || ""}
                      onChange={(e) => updateFormData("jawab", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.notes || ""}
                      onChange={(e) => updateFormData("notes", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus-border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? "Updating..." : "Update Request"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/karkun-portal/tarteeb-requests")}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTarteebRequestPage;


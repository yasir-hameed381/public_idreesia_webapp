"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
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

const AdminTarteebRequestEditPage = () => {
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
  const { hasPermission } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);
  const [mehfilCache, setMehfilCache] = useState<Record<number, Mehfil[]>>({});

  const [formData, setFormData] = useState<Partial<TarteebRequest>>({});

  const canManageZones = useMemo(
    () =>
      hasPermission(PERMISSIONS.VIEW_ZONES) ||
      !!(
        user?.is_super_admin ||
        user?.is_region_admin ||
        user?.is_all_region_admin
      ),
    [hasPermission, user?.is_all_region_admin, user?.is_region_admin, user?.is_super_admin]
  );

  const canSelectMehfils = useMemo(
    () =>
      canManageZones ||
      hasPermission(PERMISSIONS.VIEW_MEHFIL_DIRECTORY) ||
      !!(user?.is_zone_admin || user?.is_mehfil_admin),
    [
      canManageZones,
      hasPermission,
      user?.is_mehfil_admin,
      user?.is_zone_admin,
    ]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!requestId) {
        toast.error("Invalid request id");
        router.replace("/tarteeb-requests");
        return;
      }

      try {
        setLoading(true);
        const [request, zoneList] = await Promise.all([
          TarteebRequestService.getTarteebRequestById(requestId),
          TarteebRequestService.getZones(500),
        ]);

        setFormData({ ...request });

        if (canManageZones) {
          setZones(zoneList);
        } else if (request.zone_id) {
          const match = zoneList.find((zone) => zone.id === request.zone_id);
          if (match) {
            setZones([match]);
          } else if (user?.zone) {
            const zone = user.zone as Partial<Zone>;
            setZones([
              {
                id: request.zone_id,
                title_en: zone?.title_en || "Your Zone",
                city_en: zone?.city_en,
                country_en: zone?.country_en,
              },
            ]);
          }
        } else {
          setZones(zoneList);
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
        router.replace("/tarteeb-requests");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [canManageZones, requestId, router, user?.zone]);

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

  const prayerOptions = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

  const parsedBoolean = (value: any) => {
    if (value === 1) return true;
    if (value === 0) return false;
    return Boolean(value);
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
      router.push("/tarteeb-requests");
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
    <PermissionWrapper
      requiredPermission={[
        PERMISSIONS.VIEW_TARTEEB_REQUESTS,
        PERMISSIONS.UPDATE_TARTEEB_REQUESTS,
      ]}
    >
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Back
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Tarteeb Request
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name || ""}
                        onChange={(e) => updateFormData("full_name", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.father_name || ""}
                        onChange={(e) => updateFormData("father_name", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone_number || ""}
                        onChange={(e) =>
                          updateFormData("phone_number", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="150"
                        value={formData.age || ""}
                        onChange={(e) =>
                          updateFormData("age", Number(e.target.value))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city || ""}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.country || ""}
                        onChange={(e) => updateFormData("country", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.education || ""}
                        onChange={(e) =>
                          updateFormData("education", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source of Income <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.source_of_income || ""}
                        onChange={(e) =>
                          updateFormData("source_of_income", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introducer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.introducer_name || ""}
                        onChange={(e) =>
                          updateFormData("introducer_name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
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
                          checked={parsedBoolean(formData.consistent_in_prayers)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              "consistent_in_prayers",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Are you consistent in your five daily prayers?
                        </span>
                      </label>

                      {!parsedBoolean(formData.consistent_in_prayers) && (
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
                                  handleMissedPrayersChange(
                                    prayer,
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {prayer}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.makes_up_missed_prayers)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "makes_up_missed_prayers",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Do you make up for missed prayers (Qaza)?
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.consistent_in_ishraq)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "consistent_in_ishraq",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Are you consistent in Ishraq prayer?
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.consistent_in_tahajjud)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "consistent_in_tahajjud",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Are you consistent in Tahajjud prayer?
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Nawafil (voluntary prayers) daily
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.nawafil ?? ""}
                        onChange={(e) =>
                          updateFormData("nawafil", Number(e.target.value))
                        }
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.can_read_quran)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "can_read_quran",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Can you read the Quran?
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.listens_taleem_daily)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "listens_taleem_daily",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Do you listen to daily Taleem?
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily amount of Durood Sharif
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.amount_of_durood ?? ""}
                        onChange={(e) =>
                          updateFormData(
                            "amount_of_durood",
                            Number(e.target.value)
                          )
                        }
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        checked={parsedBoolean(formData.consistent_in_wazaif)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "consistent_in_wazaif",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Are you consistent in your wazaif?
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Wazaif Tarteeb Received <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_wazaif_tarteeb || ""}
                        onChange={(e) =>
                          updateFormData("last_wazaif_tarteeb", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How long have you been consistent with current wazaif? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.wazaif_consistency_duration || ""}
                        onChange={(e) =>
                          updateFormData(
                            "wazaif_consistency_duration",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.reads_current_wazaif_with_ease)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "reads_current_wazaif_with_ease",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Can you read current wazaif with ease?
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.able_to_read_additional_wazaif)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "able_to_read_additional_wazaif",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Are you able to read additional wazaif?
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={parsedBoolean(formData.does_dum_taweez)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "does_dum_taweez",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Do you practice Dum/Taweez?
                      </span>
                    </label>
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ehad Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ehad_duration || ""}
                        onChange={(e) =>
                          updateFormData("ehad_duration", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Multan Visit Frequency <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.multan_visit_frequency || ""}
                        onChange={(e) =>
                          updateFormData(
                            "multan_visit_frequency",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mehfil Attendance Frequency <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.mehfil_attendance_frequency || ""}
                        onChange={(e) =>
                          updateFormData(
                            "mehfil_attendance_frequency",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

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
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Wazaif You Read <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.other_wazaif || ""}
                        onChange={(e) =>
                          updateFormData("other_wazaif", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wazaif You Are Not Reading (from your tarteeb) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.wazaif_not_reading || ""}
                        onChange={(e) =>
                          updateFormData("wazaif_not_reading", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Wazaif You Would Like to Read <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.additional_wazaif_reading || ""}
                        onChange={(e) =>
                          updateFormData(
                            "additional_wazaif_reading",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issues or Difficulties You Are Facing <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.issues_facing || ""}
                        onChange={(e) =>
                          updateFormData("issues_facing", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jawab
                      </label>
                      <textarea
                        rows={4}
                        value={formData.jawab || ""}
                        onChange={(e) => updateFormData("jawab", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        rows={4}
                        value={formData.notes || ""}
                        onChange={(e) => updateFormData("notes", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/tarteeb-requests")}
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
    </PermissionWrapper>
  );
};

export default AdminTarteebRequestEditPage;


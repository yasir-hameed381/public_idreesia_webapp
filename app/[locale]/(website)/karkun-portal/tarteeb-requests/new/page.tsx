"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";
import { toast } from "sonner";

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

const NewTarteebRequestPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);

  const canManageZones = Boolean(
    user?.is_super_admin || user?.is_region_admin || user?.is_all_region_admin
  );

  const canSelectMehfils = Boolean(
    canManageZones || user?.is_zone_admin || user?.is_mehfil_admin
  );

  const [formData, setFormData] = useState<Partial<TarteebRequest>>({
    zone_id: user?.zone_id || 0,
    mehfil_directory_id: user?.mehfil_directory_id || 0,
    email: "",
    phone_number: "",
    full_name: "",
    father_name: "",
    age: 0,
    gender: "male",
    city: "",
    country: "",
    introducer_name: "",
    ehad_duration: "",
    source_of_income: "",
    education: "",
    marital_status: "single",
    consistent_in_wazaif: false,
    consistent_in_prayers: false,
    missed_prayers: [],
    makes_up_missed_prayers: false,
    nawafil: 0,
    can_read_quran: false,
    consistent_in_ishraq: false,
    consistent_in_tahajjud: false,
    amount_of_durood: 0,
    listens_taleem_daily: false,
    last_wazaif_tarteeb: "",
    multan_visit_frequency: "",
    mehfil_attendance_frequency: "",
    household_members_in_ehad: 0,
    reads_current_wazaif_with_ease: false,
    able_to_read_additional_wazaif: false,
    wazaif_consistency_duration: "",
    does_dum_taweez: false,
    kalimah_quantity: 0,
    allah_quantity: 0,
    laa_ilaaha_illallah_quantity: 0,
    sallallahu_alayhi_wasallam_quantity: 0,
    astagfirullah_quantity: 0,
    ayat_ul_kursi_quantity: 0,
    dua_e_talluq_quantity: 0,
    subhanallah_quantity: 0,
    dua_e_waswasey_quantity: 0,
    other_wazaif: "",
    wazaif_not_reading: "",
    additional_wazaif_reading: "",
    issues_facing: "",
  });

  const prayerOptions = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];

  const handleCheckboxChange = (field: string, value: boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMissedPrayersChange = (prayer: string, checked: boolean) => {
    const currentPrayers = formData.missed_prayers || [];
    if (checked) {
      setFormData({
        ...formData,
        missed_prayers: [...currentPrayers, prayer],
      });
    } else {
      setFormData({
        ...formData,
        missed_prayers: currentPrayers.filter((p) => p !== prayer),
      });
    }
  };

  useEffect(() => {
    if (user?.zone_id) {
      setFormData((prev) =>
        prev.zone_id && prev.zone_id > 0
          ? prev
          : { ...prev, zone_id: user.zone_id ?? prev.zone_id }
      );
    }

    if (user?.mehfil_directory_id) {
      setFormData((prev) =>
        prev.mehfil_directory_id && prev.mehfil_directory_id > 0
          ? prev
          : {
              ...prev,
              mehfil_directory_id:
                user.mehfil_directory_id ?? prev.mehfil_directory_id,
            }
      );
    }
  }, [user?.zone_id, user?.mehfil_directory_id]);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zoneList = await TarteebRequestService.getZones(200);

        if (canManageZones) {
          setZones(zoneList);
        } else if (user?.zone_id) {
          const filtered = zoneList.filter((zone) => zone.id === user.zone_id);
          if (filtered.length) {
            setZones(filtered);
          } else if (user?.zone) {
            const userZone = user.zone as Partial<Zone>;
            setZones([
              {
                id: user.zone_id,
                title_en: userZone.title_en || "Your Zone",
                city_en: userZone.city_en,
                country_en: userZone.country_en,
              },
            ]);
          } else {
            setZones([
              {
                id: user.zone_id,
                title_en: "Your Zone",
                city_en: "",
                country_en: "",
              },
            ]);
          }
        } else {
          setZones(zoneList);
        }
      } catch (error) {
        console.error("Error loading zones", error);
        toast.error("Failed to load zones");
      }
    };

    fetchZones();
  }, [canManageZones, user?.zone_id]);

  useEffect(() => {
    if (!zones.length) {
      return;
    }

    setFormData((prev) => {
      if (prev.zone_id && prev.zone_id > 0) {
        return prev;
      }

      const defaultZoneId = user?.zone_id
        ? zones.find((zone) => zone.id === user.zone_id)?.id ?? zones[0].id
        : zones[0].id;

      if (!defaultZoneId || prev.zone_id === defaultZoneId) {
        return prev;
      }

      return {
        ...prev,
        zone_id: defaultZoneId,
      };
    });
  }, [zones, user?.zone_id]);

  useEffect(() => {
    const zoneId = formData.zone_id;

    if (!zoneId || zoneId <= 0) {
      setMehfils([]);
      return;
    }

    const fetchMehfils = async () => {
      try {
        const mehfilList = await TarteebRequestService.getMehfilsByZone(
          zoneId,
          500
        );
        setMehfils(mehfilList);

        if (mehfilList.length === 0) {
          setFormData((prev) =>
            prev.mehfil_directory_id
              ? { ...prev, mehfil_directory_id: 0 }
              : prev
          );
          return;
        }

        setFormData((prev) => {
          if (prev.zone_id !== zoneId) {
            return prev;
          }

          if (
            prev.mehfil_directory_id &&
            mehfilList.some((mehfil) => mehfil.id === prev.mehfil_directory_id)
          ) {
            return prev;
          }

          const defaultMehfilId = user?.mehfil_directory_id
            ? mehfilList.find(
                (mehfil) => mehfil.id === user.mehfil_directory_id
              )?.id ?? mehfilList[0].id
            : mehfilList[0].id;

          if (!defaultMehfilId) {
            return prev;
          }

          if (prev.mehfil_directory_id === defaultMehfilId) {
            return prev;
          }

          return {
            ...prev,
            mehfil_directory_id: defaultMehfilId,
          };
        });
      } catch (error) {
        console.error("Error loading mehfils", error);
        toast.error("Failed to load mehfils");
      }
    };

    fetchMehfils();
  }, [formData.zone_id, user?.mehfil_directory_id]);

  const handleZoneChange = (value: string) => {
    const zoneId = value ? Number(value) : 0;
    setFormData((prev) => ({
      ...prev,
      zone_id: zoneId > 0 ? zoneId : 0,
      mehfil_directory_id: 0,
    }));
  };

  const handleMehfilChange = (value: string) => {
    const mehfilId = value ? Number(value) : 0;
    setFormData((prev) => ({
      ...prev,
      mehfil_directory_id: mehfilId > 0 ? mehfilId : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zone_id || !formData.mehfil_directory_id) {
      toast.error("Please select zone and mehfil");
      return;
    }

    try {
      setLoading(true);
      await TarteebRequestService.createTarteebRequest(formData);
      toast.success("Tarteeb request submitted successfully");
      router.push("/karkun-portal/tarteeb-requests");
    } catch (error: any) {
      console.error("Error creating tarteeb request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tarteeb Request Form
          </h2>
          <p className="text-gray-600 mb-6">
            Please fill out this form completely and honestly to request
            advancement in wazaif tarteeb.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Assignment Information */}
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
                    onChange={(e) => handleZoneChange(e.target.value)}
                    disabled={!canManageZones}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      !canManageZones ? "opacity-60 cursor-not-allowed" : ""
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
                    onChange={(e) => handleMehfilChange(e.target.value)}
                    disabled={!canSelectMehfils || !mehfils.length}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      !canSelectMehfils || !mehfils.length
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

            {/* Personal Information */}
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
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) =>
                      setFormData({ ...formData, father_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as "male" | "female",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.marital_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marital_status: e.target.value as
                          | "single"
                          | "married"
                          | "divorced"
                          | "widowed",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={formData.education}
                    onChange={(e) =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source of Income <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source_of_income}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        source_of_income: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introducer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.introducer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        introducer_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Religious Practices */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Religious Practices
              </h3>

              <div className="space-y-4">
                {/* Prayers */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.consistent_in_prayers}
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
                            checked={formData.missed_prayers?.includes(prayer)}
                            onChange={(e) =>
                              handleMissedPrayersChange(
                                prayer,
                                e.target.checked
                              )
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

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.makes_up_missed_prayers}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "makes_up_missed_prayers",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Do you make up for missed prayers (Qaza)?
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.consistent_in_ishraq}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "consistent_in_ishraq",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Are you consistent in Ishraq prayer?
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.consistent_in_tahajjud}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "consistent_in_tahajjud",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                    value={formData.nawafil}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nawafil: Number(e.target.value),
                      })
                    }
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.can_read_quran}
                    onChange={(e) =>
                      handleCheckboxChange("can_read_quran", e.target.checked)
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Can you read the Quran?
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.listens_taleem_daily}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "listens_taleem_daily",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                    value={formData.amount_of_durood}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount_of_durood: Number(e.target.value),
                      })
                    }
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Wazaif Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Wazaif Information
              </h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.consistent_in_wazaif}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Wazaif Tarteeb Received{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_wazaif_tarteeb}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        last_wazaif_tarteeb: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How long have you been consistent with current wazaif?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.wazaif_consistency_duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wazaif_consistency_duration: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reads_current_wazaif_with_ease}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "reads_current_wazaif_with_ease",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Can you read current wazaif with ease?
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.able_to_read_additional_wazaif}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "able_to_read_additional_wazaif",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Are you able to read additional wazaif?
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.does_dum_taweez}
                    onChange={(e) =>
                      handleCheckboxChange("does_dum_taweez", e.target.checked)
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Do you practice Dum/Taweez?
                  </span>
                </label>
              </div>

              {/* Wazaif Quantities */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">
                  Current Daily Wazaif Quantities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Kalimah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.kalimah_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kalimah_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Allah (لفظ اللہ)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allah_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allah_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Laa Ilaaha Illallah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.laa_ilaaha_illallah_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          laa_ilaaha_illallah_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Sallallahu Alayhi Wasallam
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sallallahu_alayhi_wasallam_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sallallahu_alayhi_wasallam_quantity: Number(
                            e.target.value
                          ),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Astagfirullah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.astagfirullah_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          astagfirullah_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Ayat-ul-Kursi
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ayat_ul_kursi_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ayat_ul_kursi_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Dua-e-Talluq
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dua_e_talluq_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dua_e_talluq_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Subhanallah
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.subhanallah_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subhanallah_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Dua-e-Waswasey
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dua_e_waswasey_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dua_e_waswasey_quantity: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
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
                    value={formData.ehad_duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ehad_duration: e.target.value,
                      })
                    }
                    placeholder="e.g., 5 years"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multan Visit Frequency{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.multan_visit_frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        multan_visit_frequency: e.target.value,
                      })
                    }
                    placeholder="e.g., Once a month"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mehfil Attendance Frequency{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mehfil_attendance_frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mehfil_attendance_frequency: e.target.value,
                      })
                    }
                    placeholder="e.g., Every week"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Household Members in Ehad
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.household_members_in_ehad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        household_members_in_ehad: Number(e.target.value),
                      })
                    }
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Wazaif You Read{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.other_wazaif}
                    onChange={(e) =>
                      setFormData({ ...formData, other_wazaif: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wazaif You Are Not Reading (from your tarteeb){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.wazaif_not_reading}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wazaif_not_reading: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Wazaif You Would Like to Read{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.additional_wazaif_reading}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additional_wazaif_reading: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issues or Difficulties You Are Facing{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.issues_facing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        issues_facing: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTarteebRequestPage;

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TarteebRequestService from "@/services/TarteebRequests";
import { toast } from "sonner";

const PublicTarteebRequestFormPage = () => {
  const router = useRouter();
  const params = useParams();
  const token = params?.id as string;
    console.log("Token:", token);
    console.log("Params:", params);
    console.log("Router:", router);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({
    zone_id: 0,
    mehfil_directory_id: 0,
    email: "",
    phone_number: "",
    full_name: "",
    father_name: "",
    age: 0,
    gender: "male" as "male" | "female",
    city: "",
    country: "",
    introducer_name: "",
    ehad_duration: "",
    source_of_income: "",
    education: "",
    marital_status: "single" as "single" | "married" | "divorced" | "widowed",
    consistent_in_wazaif: false,
    consistent_in_prayers: false,
    missed_prayers: [] as string[],
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
  });

  const prayerOptions = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setLoading(false);
        return;
      }

      try {
        const result = await TarteebRequestService.validateToken(token);
        console.log("Token validation result:", result);
        if (result.success && result.valid && result.data) {
          setTokenValid(true);
          // Set zone and mehfil from token if available
          const zoneId = result.data?.zone_id;
          const mehfilId = result.data?.mehfil_directory_id;
          if (zoneId != null || mehfilId != null) {
            if (result.data.zone_id) {
              setFormData((prev) => ({ ...prev, zone_id: result.data!.zone_id ?? 0 }));
            }
            if (result.data.mehfil_directory_id) {
              setFormData((prev) => ({
                ...prev,
                ...(zoneId != null && { zone_id: zoneId }),
                ...(mehfilId != null && { mehfil_directory_id: mehfilId }),
                mehfil_directory_id: result.data!.mehfil_directory_id ?? 0,
              }));
            }
          }
        } else {
          setTokenValid(false);
          toast.error(result.message || "Invalid or expired link");
        }
      } catch (error: any) {
        console.error("Error validating token:", error);
        setTokenValid(false);
        toast.error("Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submitting form data:", formData);
      setSubmitting(true);
      await TarteebRequestService.createTarteebRequestWithToken(formData, token);
      toast.success("Tarteeb request submitted successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(
        error?.response?.data?.message || "Failed to submit request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This link is invalid or has expired. Please contact the administrator for a new link.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tarteeb Request Form
          </h1>
          <p className="text-gray-600">
            Please fill out all the required fields to submit your tarteeb request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Introducer Name *
                </label>
                <input
                  type="text"
                  name="introducer_name"
                  value={formData.introducer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ehad Duration *
                </label>
                <input
                  type="text"
                  name="ehad_duration"
                  value={formData.ehad_duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source of Income *
                </label>
                <input
                  type="text"
                  name="source_of_income"
                  value={formData.source_of_income}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education *
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status *
                </label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Household Members in Ehad *
                </label>
                <input
                  type="number"
                  name="household_members_in_ehad"
                  value={formData.household_members_in_ehad}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Religious Practices */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Religious Practices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistent in Wazaif *
                </label>
                <select
                  name="consistent_in_wazaif"
                  value={formData.consistent_in_wazaif ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consistent_in_wazaif: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistent in Prayers *
                </label>
                <select
                  name="consistent_in_prayers"
                  value={formData.consistent_in_prayers ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consistent_in_prayers: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Missed Prayers
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {prayerOptions.map((prayer) => (
                  <label key={prayer} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.missed_prayers.includes(prayer)}
                      onChange={(e) =>
                        handleMissedPrayersChange(prayer, e.target.checked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{prayer}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Makes Up Missed Prayers *
                </label>
                <select
                  name="makes_up_missed_prayers"
                  value={formData.makes_up_missed_prayers ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      makes_up_missed_prayers: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nawafil *
                </label>
                <input
                  type="number"
                  name="nawafil"
                  value={formData.nawafil}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Can Read Quran *
                </label>
                <select
                  name="can_read_quran"
                  value={formData.can_read_quran ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      can_read_quran: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistent in Ishraq *
                </label>
                <select
                  name="consistent_in_ishraq"
                  value={formData.consistent_in_ishraq ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consistent_in_ishraq: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistent in Tahajjud *
                </label>
                <select
                  name="consistent_in_tahajjud"
                  value={formData.consistent_in_tahajjud ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consistent_in_tahajjud: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount of Durood *
                </label>
                <input
                  type="number"
                  name="amount_of_durood"
                  value={formData.amount_of_durood}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listens Taleem Daily *
                </label>
                <select
                  name="listens_taleem_daily"
                  value={formData.listens_taleem_daily ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      listens_taleem_daily: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Wazaif Tarteeb *
                </label>
                <input
                  type="text"
                  name="last_wazaif_tarteeb"
                  value={formData.last_wazaif_tarteeb}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multan Visit Frequency *
                </label>
                <input
                  type="text"
                  name="multan_visit_frequency"
                  value={formData.multan_visit_frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mehfil Attendance Frequency *
                </label>
                <input
                  type="text"
                  name="mehfil_attendance_frequency"
                  value={formData.mehfil_attendance_frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reads Current Wazaif with Ease *
                </label>
                <select
                  name="reads_current_wazaif_with_ease"
                  value={formData.reads_current_wazaif_with_ease ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reads_current_wazaif_with_ease: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Able to Read Additional Wazaif *
                </label>
                <select
                  name="able_to_read_additional_wazaif"
                  value={formData.able_to_read_additional_wazaif ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      able_to_read_additional_wazaif: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wazaif Consistency Duration *
                </label>
                <input
                  type="text"
                  name="wazaif_consistency_duration"
                  value={formData.wazaif_consistency_duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Does Dum Taweez *
                </label>
                <select
                  name="does_dum_taweez"
                  value={formData.does_dum_taweez ? "1" : "0"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      does_dum_taweez: e.target.value === "1",
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wazaif Quantities */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Wazaif Quantities (Card 8)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "kalimah_quantity",
                "allah_quantity",
                "laa_ilaaha_illallah_quantity",
                "sallallahu_alayhi_wasallam_quantity",
                "astagfirullah_quantity",
                "ayat_ul_kursi_quantity",
                "dua_e_talluq_quantity",
                "subhanallah_quantity",
                "dua_e_waswasey_quantity",
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                    *
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Additional Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Wazaif *
              </label>
              <textarea
                name="other_wazaif"
                value={formData.other_wazaif}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wazaif Not Reading *
              </label>
              <textarea
                name="wazaif_not_reading"
                value={formData.wazaif_not_reading}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Wazaif Reading *
              </label>
              <textarea
                name="additional_wazaif_reading"
                value={formData.additional_wazaif_reading}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicTarteebRequestFormPage;


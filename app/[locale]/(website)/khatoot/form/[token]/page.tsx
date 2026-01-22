"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import KhatService from "@/services/KhatService";
import type { Khat } from "@/types/khat";

const PublicKhatFormPage = () => {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: "",
    email: "",
    phone_number: "",
    full_name: "",
    father_name: "",
    age: "",
    city: "",
    address: "",
    introducer_name: "",
    ehad_duration: "",
    consistent_in_wazaif: false,
    consistent_in_prayers: false,
    consistent_in_ishraq: false,
    makes_up_missed_prayers: false,
    missed_prayers: [] as string[],
    can_read_quran: false,
    multan_visit_frequency: "",
    mehfil_attendance_frequency: "",
    kalimah_quantity: "",
    allah_quantity: "",
    laa_ilaaha_illallah_quantity: "",
    sallallahu_alayhi_wasallam_quantity: "",
    astagfirullah_quantity: "",
    ayat_ul_kursi_quantity: "",
    dua_e_talluq_quantity: "",
    dua_e_waswasey_quantity: "",
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
        const result = await KhatService.validateToken(token);
        
        if (result.success && result.valid && result.data) {
          setTokenValid(true);
          setTokenData(result.data);
          // Set zone and mehfil from token if available
          if (result.data.zone_id) {
            setFormData((prev) => ({ ...prev, zone_id: result.data!.zone_id }));
          }
          if (result.data.mehfil_directory_id) {
            setFormData((prev) => ({
              ...prev,
              mehfil_directory_id: result.data!.mehfil_directory_id,
            }));
          }
        } else {
          setTokenValid(false);
          toast.error(result.message || "Invalid or expired link");
        }
      } catch (error: any) {
        console.error("Error validating token:", error);
        setTokenValid(false);
        toast.error(error?.message || "Invalid or expired link");
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
      setSubmitting(true);
      
      const payload: Partial<Khat> = {
        ...formData,
        zone_id: tokenData?.zone_id || null,
        mehfil_directory_id: tokenData?.mehfil_directory_id || null,
        kalimah_quantity: parseInt(formData.kalimah_quantity) || 0,
        allah_quantity: parseInt(formData.allah_quantity) || 0,
        laa_ilaaha_illallah_quantity: parseInt(formData.laa_ilaaha_illallah_quantity) || 0,
        sallallahu_alayhi_wasallam_quantity: parseInt(formData.sallallahu_alayhi_wasallam_quantity) || 0,
        astagfirullah_quantity: parseInt(formData.astagfirullah_quantity) || 0,
        ayat_ul_kursi_quantity: parseInt(formData.ayat_ul_kursi_quantity) || 0,
        dua_e_talluq_quantity: parseInt(formData.dua_e_talluq_quantity) || 0,
        dua_e_waswasey_quantity: parseInt(formData.dua_e_waswasey_quantity) || 0,
        age: parseInt(formData.age) || 0,
        type: "khat",
        status: "pending",
      };

      // Submit with token - the service will handle token validation
      await KhatService.createKhatWithToken(payload, token);

      toast.success("Khat submitted successfully!");
      router.push("/khatoot");
    } catch (error: any) {
      console.error("Error submitting khat:", error);
      toast.error(
        error?.response?.data?.message || "Failed to submit khat"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-zinc-200">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </h1>
            <div className="flex justify-center gap-4 sm:gap-8 mb-6">
              <p className="text-sm text-zinc-600">صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ</p>
              <p className="text-sm text-zinc-600">صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ</p>
              <p className="text-sm text-zinc-600">صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ</p>
            </div>
            <h2 className="text-xl font-semibold text-green-700 mb-6">محترم شیخ صاحب!</h2>
            <div className="flex justify-center gap-4 sm:gap-8 mb-6">
              <p className="text-sm text-zinc-600">السلام علیکم ورحمۃ اللہ وبرکاتہ</p>
              <p className="text-sm text-zinc-600">السلام علیکم ورحمۃ اللہ وبرکاتہ</p>
              <p className="text-sm text-zinc-600">السلام علیکم ورحمۃ اللہ وبرکاتہ</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Masail *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
              placeholder="Enter details..."
            />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-6">Wazaif Quantities *</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { field: "kalimah_quantity", label: "Kalimah" },
                { field: "ayat_ul_kursi_quantity", label: "Ayat ul Kursi" },
                { field: "astagfirullah_quantity", label: "Astagfirullah" },
                { field: "allah_quantity", label: "Allah" },
                { field: "dua_e_talluq_quantity", label: "Dua e Talluq" },
                { field: "laa_ilaaha_illallah_quantity", label: "Laa Ilaaha Illallah" },
                { field: "sallallahu_alayhi_wasallam_quantity", label: "Sallallahu Alayhi Wasallam" },
                { field: "dua_e_waswasey_quantity", label: "Dua e Waswasey" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} *
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter quantity"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-6">Religious Practice *</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="can_read_quran"
                  checked={formData.can_read_quran}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Can read Quran *</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consistent_in_wazaif"
                  checked={formData.consistent_in_wazaif}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Consistent in wazaif *</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="consistent_in_prayers"
                  checked={formData.consistent_in_prayers}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Consistent in prayers *</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="makes_up_missed_prayers"
                  checked={formData.makes_up_missed_prayers}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Makes up missed prayers *</label>
              </div>
            </div>

            {formData.makes_up_missed_prayers && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Missed Prayers *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {prayerOptions.map((prayer) => (
                    <div key={prayer} className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 capitalize">{prayer}</label>
                      <input
                        type="checkbox"
                        checked={formData.missed_prayers.includes(prayer)}
                        onChange={(e) => handleMissedPrayersChange(prayer, e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                  placeholder="Enter frequency"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mehfil Attendance Frequency *
                </label>
                <select
                  name="mehfil_attendance_frequency"
                  value={formData.mehfil_attendance_frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Wazaif Reading
            </label>
            <textarea
              name="additional_wazaif_reading"
              value={formData.additional_wazaif_reading}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
              placeholder="Enter additional wazaif..."
            />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-6">Contact Information *</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name *
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
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
                  dir="ltr"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: +92XXXXXXXXXX</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicKhatFormPage;


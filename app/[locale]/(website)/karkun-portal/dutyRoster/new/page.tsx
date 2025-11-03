"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DutyTypeService, { DutyType } from "@/services/DutyTypes";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface Zone {
  id: number;
  title_en: string;
  city_en?: string;
  country_en?: string;
}

interface Mehfil {
  id: number;
  name_en: string;
  mehfil_number?: string;
  city_en?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

export default function NewDutyRosterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<any>({
    user_id: "",
    zone_id: user?.zone_id || "",
    mehfil_directory_id: user?.mehfil_directory_id || "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.zone_id) {
      fetchDutyTypes();
      fetchMehfils();
    }
  }, [formData.zone_id]);

  const fetchInitialData = async () => {
    await Promise.all([fetchZones(), fetchUsers()]);
  };

  const fetchDutyTypes = async () => {
    if (!formData.zone_id) return;
    try {
      const types = await DutyTypeService.getDutyTypesByZone(
        Number(formData.zone_id)
      );
      setDutyTypes(types);
    } catch (error) {
      console.error("Failed to fetch duty types:", error);
      toast.error("Failed to fetch duty types");
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${API_URL}/zone?page=1&size=1000`);
      setZones(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    }
  };

  const fetchMehfils = async () => {
    if (!formData.zone_id) return;
    try {
      const response = await axios.get(
        `${API_URL}/mehfil-directory?zone_id=${formData.zone_id}&page=1&size=1000`
      );
      setMehfils(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch mehfils:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/adminUsers?page=1&size=1000`
      );
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || formData.user_id === "select") {
      toast.error("Please select a user");
      return;
    }

    if (!formData.zone_id) {
      toast.error("Please select a zone");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        zone_id:
          formData.zone_id && formData.zone_id !== "none"
            ? parseInt(formData.zone_id)
            : undefined,
        mehfil_directory_id:
          formData.mehfil_directory_id &&
          formData.mehfil_directory_id !== "none"
            ? parseInt(formData.mehfil_directory_id)
            : undefined,
      };

      await axios.post(`${API_URL}/duty-rosters-data/add`, payload);
      toast.success("Duty roster created successfully!");
      router.push("/karkun-portal/dutyRoster");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create duty roster";
      toast.error(errorMessage);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  const canChangeZone = user?.is_super_admin || user?.is_region_admin;
  const canChangeMehfil = canChangeZone || user?.is_zone_admin;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Duty Roster
          </h1>
          <p className="text-gray-600 mt-2">Assign weekly duties to a karkun</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* User Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User *
                    </label>
                    <select
                      value={formData.user_id?.toString() || "select"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user_id:
                            e.target.value !== "select" ? e.target.value : "",
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="select">Select a user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id.toString()}>
                          {user.name} {user.email && `(${user.email})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zone Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zone *
                    </label>
                    <select
                      value={formData.zone_id?.toString() || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          zone_id: e.target.value || "",
                          mehfil_directory_id: "", // Reset mehfil when zone changes
                        })
                      }
                      disabled={!canChangeZone}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !canChangeZone
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : ""
                      }`}
                      required
                    >
                      <option value="">Select a zone...</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id.toString()}>
                          {zone.title_en} {zone.city_en && `- ${zone.city_en}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mehfil Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mehfil (Optional)
                    </label>
                    <select
                      value={formData.mehfil_directory_id?.toString() || "none"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mehfil_directory_id:
                            e.target.value !== "none" ? e.target.value : "",
                        })
                      }
                      disabled={!canChangeMehfil || !formData.zone_id}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !canChangeMehfil || !formData.zone_id
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : ""
                      }`}
                    >
                      <option value="none">None</option>
                      {mehfils.map((mehfil) => (
                        <option key={mehfil.id} value={mehfil.id.toString()}>
                          {mehfil.mehfil_number &&
                            `#${mehfil.mehfil_number} - `}
                          {mehfil.name_en}
                          {mehfil.city_en && ` - ${mehfil.city_en}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Weekly Duty Assignments */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Weekly Duty Assignments
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Assign a duty type for each day of the week
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS.map((day, index) => (
                    <div key={day}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {DAY_LABELS[index]}
                      </label>
                      <select
                        value={
                          formData[`duty_type_id_${day}`]?.toString() || "none"
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`duty_type_id_${day}`]:
                              e.target.value !== "none"
                                ? parseInt(e.target.value)
                                : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        {dutyTypes.map((dt) => (
                          <option key={dt.id} value={dt.toString()}>
                            {dt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-32 justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  "Create Roster"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

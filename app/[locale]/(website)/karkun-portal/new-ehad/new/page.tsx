"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

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
  name_en: string;
  address_en?: string;
}

// Format phone number (matching Laravel formatPhoneNumber)
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // Format as +92XXXXXXXXXX if it starts with 92, otherwise return as is
  if (digits.startsWith("92") && digits.length >= 12) {
    return `+${digits}`;
  }
  return phone;
};

const NewEhadFormPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError, showSuccess } = useToast();

  const editId = searchParams.get("id");
  const isEdit = !!editId;

  // Check if user is in Multan Zone (matching Laravel logic)
  const isMultanZone = user?.zone?.title_en === "Multan Zone";

  // Permission logic (matching Laravel getCanEditZoneProperty/getCanEditMehfilProperty)
  const canEditZone =
    isMultanZone ||
    user?.is_all_region_admin ||
    user?.is_region_admin ||
    false;
  const canEditMehfil =
    isMultanZone ||
    user?.is_all_region_admin ||
    user?.is_region_admin ||
    user?.is_zone_admin ||
    false;

  // Form state
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [marfat, setMarfat] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isMultanEhad, setIsMultanEhad] = useState(false);
  const [zoneId, setZoneId] = useState<number | null>(user?.zone_id || null);
  const [mehfilDirectoryId, setMehfilDirectoryId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );

  // Dropdown data
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  // Load zones
  useEffect(() => {
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

    if (user) {
      loadZones();
    }
  }, [user]);

  // Load mehfils when zone changes
  useEffect(() => {
    const loadMehfils = async () => {
      if (!zoneId) {
        setMehfilDirectories([]);
        return;
      }

      try {
        const response = await apiClient.get("/mehfil-directory", {
          params: { zoneId: zoneId, size: 1000 },
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

    loadMehfils();
  }, [zoneId]);

  // Load existing data for edit
  useEffect(() => {
    const loadEditData = async () => {
      if (!editId) {
        // Initialize for new record
        setIsMultanEhad(isMultanZone);
        setZoneId(user?.zone_id || null);
        setMehfilDirectoryId(user?.mehfil_directory_id || null);
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const response = await apiClient.get(`/new-karkun/${editId}`);
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setName(data.name || "");
          setFatherName(data.father_name || "");
          setMarfat(data.marfat || "");
          setPhoneNumber(data.phone_number || data.phone_no || "");
          setAddress(data.address || "");
          setIsMultanEhad(data.is_multan_ehad || false);
          setZoneId(data.zone_id || user?.zone_id || null);
          setMehfilDirectoryId(data.mehfil_directory_id || user?.mehfil_directory_id || null);
        } else {
          showError("Failed to load new ehad data");
          router.push("/karkun-portal/new-ehad");
        }
      } catch (error: any) {
        console.error("Error loading edit data:", error);
        showError("Failed to load new ehad data");
        router.push("/karkun-portal/new-ehad");
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      loadEditData();
    }
  }, [editId, user, router, showError, isMultanZone]);

  // Reset mehfil when zone changes
  useEffect(() => {
    if (zoneId !== user?.zone_id && !isEdit) {
      setMehfilDirectoryId(null);
    }
  }, [zoneId, user?.zone_id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      showError("Name is required");
      return;
    }

    if (!fatherName.trim()) {
      showError("Father name is required");
      return;
    }

    if (!marfat.trim()) {
      showError("Marfat is required");
      return;
    }

    if (!phoneNumber.trim()) {
      showError("Phone number is required");
      return;
    }

    if (!zoneId) {
      showError("Zone is required");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const payload = {
        name: name.trim(),
        father_name: fatherName.trim(),
        marfat: marfat.trim(),
        phone_no: formattedPhone,
        address: address.trim() || null,
        zone_id: zoneId,
        mehfil_directory_id: mehfilDirectoryId || null,
      };

      if (isEdit && editId) {
        await apiClient.put(`/new-karkun/update/${editId}`, payload);
        showSuccess("New Ehad updated successfully");
      } else {
        await apiClient.post("/new-karkun/add", payload);
        showSuccess("New Ehad created successfully");
      }

      router.push("/karkun-portal/new-ehad");
    } catch (error: any) {
      console.error("Error saving new ehad:", error);
      showError(
        error.response?.data?.message ||
          "Failed to save new ehad. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/karkun-portal/new-ehad"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to New Ehads
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit New Ehad" : "Create New Ehad"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Update new ehad information" : "Add a new ehad entry"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                  required
                  maxLength={255}
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father name"
                  required
                  maxLength={255}
                />
              </div>

              {/* Marfat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marfat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={marfat}
                  onChange={(e) => setMarfat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter marfat"
                  required
                  maxLength={255}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={zoneId || ""}
                  onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!canEditZone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
                {!canEditZone && (
                  <p className="text-xs text-gray-500 mt-1">
                    You don't have permission to change the zone
                  </p>
                )}
              </div>

              {/* Mehfil Directory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil Directory
                </label>
                <select
                  value={mehfilDirectoryId || ""}
                  onChange={(e) =>
                    setMehfilDirectoryId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={!zoneId || !canEditMehfil}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Mehfil Directory (Optional)</option>
                  {mehfilDirectories.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en || mehfil.address_en}
                    </option>
                  ))}
                </select>
                {!canEditMehfil && (
                  <p className="text-xs text-gray-500 mt-1">
                    You don't have permission to change the mehfil
                  </p>
                )}
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter address (optional)"
              />
            </div>

            {/* Multan Ehad Checkbox (only for Multan Zone users) */}
            {isMultanZone && (
              <div className="mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultanEhad}
                    onChange={(e) => setIsMultanEhad(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Is Multan Ehad
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
            <Link
              href="/karkun-portal/new-ehad"
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
                ? "Update New Ehad"
                : "Create New Ehad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEhadFormPage;


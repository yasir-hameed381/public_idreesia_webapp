"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Lock } from "lucide-react";
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
  timeout: 10000, // 10 second timeout to prevent hanging
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

interface Karkun {
  id: number;
  name: string;
  email: string;
}

const KarkunPasswordFormPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { showError, showSuccess } = useToast();

  const locale = (typeof pathname === "string" && pathname.split("/")[1]) || "en";
  const karkunId = params?.id ? Number(params.id) : null;

  const [karkun, setKarkun] = useState<Karkun | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const loadingRef = useRef(false);

  // Load karkun data - fetch directly from API like Laravel (no sessionStorage)
  useEffect(() => {
    let isMounted = true;

    // Prevent multiple simultaneous requests
    if (loadingRef.current) return;

    const loadKarkun = async () => {
      if (!karkunId) {
        showError("Invalid karkun ID");
        router.push(`/${locale}/karkun-portal/karkunan`);
        return;
      }

      try {
        loadingRef.current = true;
        setLoadingData(true);
        let response;
        let raw;

        // Try /karkun/{id} first, then fallback to /adminusers/{id} if 404
        // This matches Laravel's approach: User::findOrFail($id)
        try {
          response = await apiClient.get(`/karkun/${karkunId}`);
          const body = response.data;
          raw = body?.data ?? body;
        } catch (karkunError: any) {
          // If 404 or timeout, try /adminusers/{id} as fallback
          if (karkunError.response?.status === 404 || karkunError.code === 'ECONNABORTED') {
            try {
              response = await apiClient.get(`/adminusers/${karkunId}`);
              const body = response.data;
              raw = body?.data ?? body;
            } catch (adminError: any) {
              console.error("Error loading karkun from both endpoints:", {
                karkun: {
                  status: karkunError.response?.status,
                  message: karkunError.message,
                },
                adminusers: {
                  status: adminError.response?.status,
                  message: adminError.message,
                },
                karkunId,
              });
              
              if (!isMounted) return;
              showError("Failed to load karkun data");
              router.push(`/${locale}/karkun-portal/karkunan`);
              return;
            }
          } else {
            if (!isMounted) return;
            console.error("Error loading karkun:", karkunError);
            showError("Failed to load karkun data");
            router.push(`/${locale}/karkun-portal/karkunan`);
            return;
          }
        }

        if (!isMounted) return;

        if (!raw || !raw.id) {
          showError("Karkun not found");
          router.push(`/${locale}/karkun-portal/karkunan`);
          return;
        }

        setKarkun({
          id: raw.id,
          name: raw.name || "",
          email: raw.email || "",
        });
      } catch (error: any) {
        if (!isMounted) return;
        console.error("Error loading karkun:", error);
        showError("Failed to load karkun data");
        router.push(`/${locale}/karkun-portal/karkunan`);
      } finally {
        if (isMounted) {
          setLoadingData(false);
          loadingRef.current = false;
        }
      }
    };

    if (karkunId && !loadingRef.current) {
      loadKarkun();
    }

    return () => {
      isMounted = false;
      loadingRef.current = false;
    };
  }, [karkunId, locale, router, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (matching Laravel rules)
    if (!password) {
      showError("Password is required");
      return;
    }

    if (password.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    // Check for mixed case
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    if (!hasUpperCase || !hasLowerCase) {
      showError("Password must contain both uppercase and lowercase letters");
      return;
    }

    // Check for numbers
    const hasNumber = /[0-9]/.test(password);
    if (!hasNumber) {
      showError("Password must contain at least one number");
      return;
    }

    if (password !== passwordConfirmation) {
      showError("Password confirmation does not match");
      return;
    }

    if (!karkunId) {
      showError("Invalid karkun ID");
      return;
    }

    setLoading(true);
    try {
      // Try adminusers endpoint first, then fallback to karkun
      try {
        await apiClient.put(`/adminusers/update/${karkunId}`, {
          password,
        });
      } catch (adminError: any) {
        if (adminError.response?.status === 404) {
          // Fallback to karkun endpoint
          await apiClient.put(`/karkun/update/${karkunId}`, {
            password,
          });
        } else {
          throw adminError;
        }
      }

      showSuccess("Password updated successfully");
      router.push(`/${locale}/karkun-portal/karkunan`);
    } catch (error: any) {
      console.error("Error updating password:", error);
      showError(
        error.response?.data?.message ||
          "Failed to update password. Please try again."
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

  if (!karkun) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Karkun not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/karkun-portal/karkunan`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Karkuns
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Change Password
          </h1>
          <p className="text-gray-600 mt-1">
            Update password for {karkun.name} ({karkun.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Lock className="text-blue-600" size={24} />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Password Requirements
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Password must be at least 8 characters, contain uppercase and lowercase letters, and at least one number.
                </p>
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Password Confirmation Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
            <Link
              href={`/${locale}/karkun-portal/karkunan`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KarkunPasswordFormPage;


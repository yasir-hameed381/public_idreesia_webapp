"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { KarkunanForm } from "@/app/[locale]/(admin)/components/Karkuns/karkunan-form";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
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

interface KarkunanFormData {
  id?: number;
  name: string;
  email: string;
  phone_number: string | null;
  cnic_no?: string;
  father_name: string | null;
  user_type: string;
  zone_id: string | number | null;
  mehfil_directory_id: string | number | null;
  ehad_year: string | number | null;
  birth_year: string | number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  duty_type?: string;
  duty_days: string[];
  is_zone_admin?: boolean;
  is_mehfil_admin?: boolean;
}

function parseDutyDays(
  duty_days: string | string[] | null | undefined
): string[] {
  if (!duty_days) return [];
  if (Array.isArray(duty_days)) return duty_days;
  try {
    const parsed = JSON.parse(duty_days as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Edit karkun - Laravel: Route::get('/karkun/form/{id}', KarkunForm::class) */
export default function KarkunanFormEditPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();
  const [editData, setEditData] = useState<KarkunanFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id || typeof id !== "string") {
      showError("Invalid karkun ID");
      router.push("/karkun-portal/karkunan");
      setLoading(false);
      return;
    }

    const karkunId = parseInt(id, 10);
    if (isNaN(karkunId)) {
      showError("Invalid karkun ID");
      router.push("/karkun-portal/karkunan");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const response = await apiClient.get(`/karkun/${karkunId}`);
        const body = response.data;
        const raw = body?.data ?? body;

        if (!raw) {
          showError("Failed to load karkun data");
          router.push("/karkun-portal/karkunan");
          setLoading(false);
          return;
        }

        const mappedData: KarkunanFormData = {
          id: raw.id,
          name: raw.name ?? "",
          email: raw.email ?? "",
          phone_number: raw.phone_number ?? raw.mobile_no ?? null,
          cnic_no: raw.id_card_number ?? raw.cnic_no ?? "",
          father_name: raw.father_name ?? null,
          user_type: raw.user_type ?? "karkun",
          zone_id: raw.zone_id ?? null,
          mehfil_directory_id: raw.mehfil_directory_id ?? null,
          ehad_year: raw.ehad_year ?? null,
          birth_year: raw.birth_year ?? null,
          address: raw.address ?? null,
          city: raw.city ?? null,
          country: raw.country ?? null,
          duty_type: raw.duty_type ?? "",
          duty_days: parseDutyDays(raw.duty_days),
          is_zone_admin: raw.is_zone_admin ?? false,
          is_mehfil_admin:
            raw.is_mehfil_admin ?? raw.is_mehfile_admin ?? false,
        };

        setEditData(mappedData);
      } catch (error) {
        console.error("Error loading karkun data:", error);
        showError("Failed to load karkun data");
        router.push("/karkun-portal/karkunan");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params?.id, router, showError]);

  const handleSuccess = () => {
    router.push("/karkun-portal/karkunan");
  };

  const handleCancel = () => {
    router.push("/karkun-portal/karkunan");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-gray-50 bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

  if (!editData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <KarkunanForm
        editData={editData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

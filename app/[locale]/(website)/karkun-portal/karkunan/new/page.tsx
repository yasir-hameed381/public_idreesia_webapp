"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { useToast } from "@/hooks/useToast";
import { KarkunanForm } from "@/app/[locale]/(admin)/components/Karkuns/karkunan-form";

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
  password?: string;
  confirmPassword?: string;
  duty_type?: string;
  duty_days: string[];
  is_zone_admin?: boolean;
  is_mehfil_admin?: boolean;
}

export default function KarkunanFormPage() {
  const params = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState<KarkunanFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we're in "new" mode
        if (params.id === "new") {
          setEditData(null);
          setLoading(false);
          return;
        }

        // For edit mode, first check sessionStorage
        const sessionData = sessionStorage.getItem("editRow");
        if (sessionData) {
          try {
            const karkun = JSON.parse(sessionData);

            // Map the API response to form structure
            const mappedData: KarkunanFormData = {
              id: karkun.id,
              name: karkun.name || "",
              email: karkun.email || "",
              phone_number: karkun.phone_number || null,
              cnic_no: karkun.id_card_number || "",
              father_name: karkun.father_name || null,
              user_type: karkun.user_type || "",
              zone_id: karkun.zone_id || null,
              mehfil_directory_id: karkun.mehfil_directory_id || null,
              ehad_year: karkun.ehad_year || null,
              birth_year: karkun.birth_year || null,
              address: karkun.address || null,
              city: karkun.city || null,
              country: karkun.country || null,
              duty_type: karkun.duty_type || "",
              duty_days: karkun.duty_days
                ? typeof karkun.duty_days === "string"
                  ? JSON.parse(karkun.duty_days)
                  : karkun.duty_days
                : [],
              is_zone_admin: karkun.is_zone_admin || false,
              is_mehfil_admin: karkun.is_mehfil_admin || false,
            };

            setEditData(mappedData);
            setLoading(false);

            // Clear session storage after loading
            sessionStorage.removeItem("editRow");
            return;
          } catch (parseError) {
            console.error("Error parsing session data:", parseError);
          }
        }
        // If no session data and params.id exists, fetch from API
        if (params.id && params.id !== "new") {
          const userId = parseInt(params.id as string);
          if (!isNaN(userId)) {
            const userData = await AdminUsersService.getById(userId);

            // Map the API response to form structure
            const mappedData: KarkunanFormData = {
              id: userData.id,
              name: userData.name || "",
              email: userData.email || "",
              phone_number: userData.phone_number || null,
              cnic_no: userData.id_card_number || "",
              father_name: userData.father_name || null,
              user_type: userData.user_type || "",
              zone_id: userData.zone_id || null,
              mehfil_directory_id: userData.mehfil_directory_id || null,
              ehad_year: userData.ehad_year || null,
              birth_year: userData.birth_year || null,
              address: userData.address || null,
              city: userData.city || null,
              country: userData.country || null,
              duty_type: userData.duty_type || "",
              duty_days: userData.duty_days
                ? typeof userData.duty_days === "string"
                  ? JSON.parse(userData.duty_days)
                  : userData.duty_days
                : [],
              is_zone_admin: userData.is_zone_admin || false,
              is_mehfil_admin: userData.is_mehfil_admin || false,
            };

            setEditData(mappedData);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        showError("Failed to load user data");
        router.push("/karkunan");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router, showError]);

  const handleSuccess = () => {
    // Clean up session storage
    sessionStorage.removeItem("editRow");
    router.push("/karkun-portal/karkunan/karkunan");
  };

  const handleCancel = () => {
    // Clean up session storage
    sessionStorage.removeItem("editRow");
    router.push("/karkun-portal/karkunan/karkunan");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-gray-50 bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

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

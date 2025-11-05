"use client";
import { useState, useEffect } from "react";
import { AdminUserForm } from "../../../components/Admin-Users/adminUser-form";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useParams } from "next/navigation";

export default function AdminUserPage() {
  const params = useParams();
  const id = params?.id as string;

  const [editData, setEditData] = useState<any>(null);
  const [loading, setLoading] = useState(id !== "new"); // only load if not "new"
  const router = useRouter();
  const { showError } = useToast();

  useEffect(() => {
    if (id === "new") {
      setLoading(false);
      return;
    }

    const fetchAdminUser = async () => {
      try {
        const userData = await AdminUsersService.getById(parseInt(id));

        // Check if userData exists and has the expected structure
        if (!userData) {
          throw new Error("No user data received from server");
        }

        // Transform API data to match form structure
        // Extract roles from the roles array (backend returns roles as an array)
        const roleIds = userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0
          ? userData.roles.map((role: any) => role.id.toString())
          : userData.role_id 
            ? [userData.role_id.toString()]
            : [];

        const transformedData = {
          id: userData.id,
          name: userData.name || "",
          name_ur: userData.name_ur || "",
          email: userData.email || "",
          phone_number: userData.phone_number || "",
          mobile_no: userData.phone_number || "", // Map phone_number to mobile_no for form
          id_card_number: userData.id_card_number || "",
          father_name: userData.father_name || "",
          father_name_ur: userData.father_name_ur || "",
          user_type: userData.user_type || "",
          zone_id: userData.zone_id?.toString() || "",
          mehfil_directory_id: userData.mehfil_directory_id?.toString() || "",
          ehad_year: userData.ehad_year?.toString() || "",
          birth_year: userData.birth_year?.toString() || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "",
          role_id: userData.role_id?.toString() || (roleIds.length > 0 ? roleIds[0] : ""),
          role_ids: roleIds,
          roles: userData.roles || [],
          duty_type: userData.duty_type || "",
          duty_days: userData.duty_days || [],
          is_zone_admin: userData.is_zone_admin || false,
          is_mehfil_admin: userData.is_mehfil_admin || false,
          is_super_admin: userData.is_super_admin || false,
          avatar: userData.avatar || "",
          password: "", // Don't populate password for security
          confirmPassword: "",
        };

        setEditData(transformedData);
      } catch (error) {
        console.error("Error fetching admin user:", error);
        showError("Failed to load admin user data");
        router.push("/admin-users");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminUser();
  }, [id, router, showError]);

  const handleCancel = () => router.push("/admin-users");
  const handleSuccess = () => router.push("/admin-users");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin user data...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminUserForm
      editingUser={editData} // null for new user
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

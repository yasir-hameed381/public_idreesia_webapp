"use client";
import type React from "react";
import { useForm } from "react-hook-form";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/useToast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Upload, Sparkles } from "lucide-react";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { useAuth } from "@/hooks/useAuth";

interface KarkunanFormData {
  id?: number;
  name: string;
  name_ur?: string;
  email: string;
  phone_number: string | null;
  cnic_no?: string;
  father_name: string | null;
  father_name_ur?: string;
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
  change_password?: boolean;
  duty_type?: string;
  duty_days: string[];
  is_zone_admin?: boolean;
  is_mehfil_admin?: boolean;
  avatar?: string | null;
  region_id?: number | null;
}

export function KarkunanForm({
  editData,
  onCancel,
  onSuccess,
}: {
  editData?: KarkunanFormData | null;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });
  const { data: mehfilData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: "",
    search: "",
  });
  const { showError, showSuccess } = useToast();
  const ALL_ZONES = zonesData?.data || [];
  const ALL_MEHFILS = mehfilData?.data || [];
  const { user: authUser } = useAuth();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<KarkunanFormData>({
    defaultValues: {
      duty_days: [],
      is_zone_admin: false,
      is_mehfil_admin: false,
      change_password: false,
      user_type: "karkun",
    },
  });

  // Filter mehfils based on selected zone
  const selectedZoneId = watch("zone_id");
  const filteredMehfils = selectedZoneId
    ? ALL_MEHFILS.filter((m: any) => m.zone_id === Number(selectedZoneId))
    : [];
  
  const changePassword = watch("change_password");

  // Set form values when editData changes
  useEffect(() => {
    if (editData) {
      console.log("Setting form with edit data:", editData);
      reset({
        id: editData.id,
        name: editData.name || "",
        name_ur: (editData as any).name_ur || "",
        father_name: editData.father_name || "",
        father_name_ur: (editData as any).father_name_ur || "",
        phone_number: editData.phone_number || "",
        cnic_no: editData.cnic_no || "",
        address: editData.address || "",
        birth_year: editData.birth_year?.toString() || "",
        ehad_year: editData.ehad_year?.toString() || "",
        duty_days: editData.duty_days || [],
        duty_type: editData.duty_type || "",
        zone_id: editData.zone_id?.toString() || "",
        mehfil_directory_id: editData.mehfil_directory_id?.toString() || "",
        email: editData.email || "",
        user_type: editData.user_type || "karkun",
        city: editData.city || "",
        country: editData.country || "",
        is_zone_admin: editData.is_zone_admin || false,
        is_mehfil_admin: editData.is_mehfil_admin || false,
        change_password: false,
        avatar: (editData as any).avatar || null,
        region_id: (editData as any).region_id || authUser?.region_id || null,
      });
      
      // Load avatar preview if exists
      if ((editData as any).avatar) {
        setAvatarPath((editData as any).avatar);
        // For existing avatars, we might need to fetch a temporary URL from backend
        // For now, we'll just set the path
      }
    } else {
      // Set default values for new karkun
      reset({
        zone_id: authUser?.zone_id?.toString() || "",
        mehfil_directory_id: authUser?.mehfil_directory_id?.toString() || "",
        region_id: authUser?.region_id || null,
        user_type: "karkun",
      });
    }
  }, [editData, reset, authUser]);
  
  // Update mehfils when zone changes
  useEffect(() => {
    if (selectedZoneId) {
      setValue("mehfil_directory_id", "");
    }
  }, [selectedZoneId, setValue]);
  
  // Handle avatar file selection
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError("Please select an image file");
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError("Image size must be less than 2MB");
        return;
      }
      
      // Validate dimensions (min 200x200)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          showError("Image dimensions must be at least 200x200 pixels");
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setAvatar(file);
        setAvatarPreview(objectUrl);
        setAvatarRemoved(false);
      };
      img.onerror = () => {
        showError("Invalid image file");
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    }
  }, [showError]);
  
  // Remove avatar
  const removeAvatar = useCallback(() => {
    setAvatar(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
    setAvatarPath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);
  
  // Upload avatar to S3
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", "avatars");
      formData.append("filename", file.name);
      formData.append("contentType", file.type);

      const apiBaseUrl = getApiBaseUrl();
      const headers = new Headers();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // apiBaseUrl already includes /api, so we use /v1 directly
      const response = await fetch(`${apiBaseUrl}/v1/file-upload/file-upload`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data.path || result.data.key || "";
      }

      throw new Error(result.message || "Upload failed");
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  // Generate email function (matching Laravel logic)
  const generateEmail = useCallback(() => {
    const name = getValues("name");
    const zoneId = getValues("zone_id");
    
    if (!name || !zoneId) {
      showError("Please enter name and zone first.");
      return;
    }
    
    // Create email prefix from name (slug format)
    const emailPrefix = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let karkunId: string;
    if (editData?.id) {
      // For edit mode, use existing karkun_id if available
      karkunId = (editData as any).karkun_id || `${zoneId}-${editData.id}`;
    } else {
      // For new karkun, generate ID based on zone and next user ID
      // In a real scenario, you might want to fetch the next ID from backend
      const timestamp = Date.now();
      karkunId = `${zoneId}-${timestamp}`;
    }
    
    const generatedEmail = `${emailPrefix}-${karkunId}@idreesia.com`;
    setValue("email", generatedEmail);
    showSuccess("Email generated successfully!");
  }, [getValues, setValue, editData, showError, showSuccess]);
  
  // Check if password can be changed (matching Laravel logic)
  const canChangePassword = useCallback((): boolean => {
    if (!editData?.id) {
      return false;
    }
    
    const userType = getValues("user_type");
    const isZoneAdmin = getValues("is_zone_admin");
    const isMehfilAdmin = getValues("is_mehfil_admin");
    
    return userType === "karkun" && 
           !isZoneAdmin && 
           !isMehfilAdmin;
  }, [editData, getValues]);

  const onSubmit = async (formData: KarkunanFormData) => {
    try {
      // Check permissions before submission
      const canCreate =
        isSuperAdmin || hasPermission(PERMISSIONS.CREATE_KARKUNAN);
      const canEdit = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_KARKUNAN);

      if (editData && !canEdit) {
        showError("You don't have permission to edit karkunan.");
        return;
      }

      if (!editData && !canCreate) {
        showError("You don't have permission to create karkunan.");
        return;
      }

      // Validate password if changing password
      if (changePassword && canChangePassword()) {
        if (!formData.password || formData.password.trim() === "") {
          showError("Password is required when changing password.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          showError("Passwords do not match.");
          return;
        }
      }

      console.log("Form data submitted:", formData);

      // Upload avatar if a new one is selected
      let avatarPathToSave = avatarPath;
      if (avatar && !avatarRemoved) {
        avatarPathToSave = await uploadAvatar(avatar);
      } else if (avatarRemoved && editData) {
        avatarPathToSave = null;
      }

      // Prepare the data for API call
      const apiData: any = {
        name: formData.name,
        name_ur: formData.name_ur || "",
        email: formData.email,
        father_name: formData.father_name,
        father_name_ur: formData.father_name_ur || "",
        phone_number: formData.phone_number,
        id_card_number: formData.cnic_no,
        address: formData.address,
        birth_year: parseInt(String(formData.birth_year)) || 0,
        ehad_year: parseInt(String(formData.ehad_year)) || 0,
        duty_days: formData.duty_days,
        duty_type: formData.duty_type,
        city: formData.city,
        country: formData.country,
        user_type: formData.user_type || "karkun",
        zone_id: formData.zone_id ? parseInt(String(formData.zone_id)) : null,
        mehfil_directory_id: formData.mehfil_directory_id
          ? parseInt(String(formData.mehfil_directory_id))
          : null,
        is_zone_admin: formData.is_zone_admin || false,
        is_mehfil_admin: formData.is_mehfil_admin || false,
        region_id: formData.region_id || authUser?.region_id || null,
      };

      // Include avatar
      if (avatarPathToSave !== null) {
        apiData.avatar = avatarPathToSave;
      }

      // Handle password (matching Laravel logic)
      if (!editData) {
        // For new users, generate default password: email_timestamp@idreesia
        const defaultPassword = `${formData.email}_${Date.now()}@idreesia`;
        apiData.password = defaultPassword;
        apiData.email_verified_at = new Date().toISOString();
      } else if (changePassword && canChangePassword() && formData.password) {
        apiData.password = formData.password;
      }

      console.log("API data being sent:", apiData);

      if (editData && editData.id) {
        setIsUpdating(true);
        await AdminUsersService.update(editData.id, apiData);
        showSuccess("Karkun updated successfully!");
      } else {
        setIsLoading(true);
        await AdminUsersService.create(apiData);
        showSuccess("Karkun added successfully!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving Karkun:", error);
      showError(error.message || "Failed to save Karkun. Please try again.");
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  if (isLoading || isUpdating || isUploadingAvatar) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft size={20} />
            Back to Karkuns
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {editData ? "Edit Karkun" : "Create Karkun"}
          </h1>
          <p className="text-gray-600 mt-1">
            {editData
              ? "Update karkun information"
              : "Create a new karkun account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6">
            {/* Avatar Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                {avatarPreview || avatarPath ? (
                  <div className="relative">
                    <img
                      src={avatarPreview || (avatarPath ? `${getApiBaseUrl().replace('/api', '')}/storage/${avatarPath}` : '')}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 cursor-pointer"
                  >
                    <Upload size={16} />
                    {avatarPreview || avatarPath ? "Change Avatar" : "Upload Avatar"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 200x200 pixels, max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Roles */}
            <div className="flex gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_zone_admin")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Zone Admin
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_mehfil_admin")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Mehfil Admin
                </span>
              </label>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>
                )}
              </div>

              {/* Name UR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (UR) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name_ur", { required: "Urdu name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام درج کریں"
                  dir="rtl"
                />
                {errors.name_ur && (
                  <p className="text-red-500 text-xs mt-1">{errors.name_ur.message as string}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  <button
                    type="button"
                    onClick={generateEmail}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
                    title="Generate email automatically"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register("phone_number")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03XXXXXXXXX"
                />
              </div>

              {/* ID Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Card Number
                </label>
                <input
                  {...register("cnic_no")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXXXXXXXXXXXX"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("father_name", { required: "Father name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter father's name"
                />
                {errors.father_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.father_name.message as string}</p>
                )}
              </div>

              {/* Father Name UR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name (UR) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("father_name_ur", { required: "Urdu father name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="والد کا نام درج کریں"
                  dir="rtl"
                />
                {errors.father_name_ur && (
                  <p className="text-red-500 text-xs mt-1">{errors.father_name_ur.message as string}</p>
                )}
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  {...register("user_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select User Type</option>
                  <option value="karkun">Karkun</option>
                  <option value="ehad_karkun">Ehad Karkun</option>
                </select>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <select
                  {...register("zone_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {ALL_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mehfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehfil <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("mehfil_directory_id", { required: "Mehfil is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedZoneId}
                >
                  <option value="">Select Mehfil</option>
                  {filteredMehfils.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en || mehfil.address_en}
                    </option>
                  ))}
                </select>
                {errors.mehfil_directory_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.mehfil_directory_id.message as string}</p>
                )}
              </div>

              {/* Ehad Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ehad Year
                </label>
                <input
                  type="number"
                  {...register("ehad_year")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YYYY"
                />
              </div>

              {/* Birth Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Year
                </label>
                <input
                  type="number"
                  {...register("birth_year")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YYYY"
                />
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  {...register("city")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  {...register("country")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Password Fields */}
            {editData && canChangePassword() && (
              <div className="mt-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("change_password")}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Change Password
                  </span>
                </label>
              </div>
            )}
            
            {(changePassword && canChangePassword()) || !editData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editData && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    {...register("password", {
                      required: !editData ? "Password is required" : (changePassword ? "Password is required when changing password" : false),
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      editData
                        ? "Enter new password"
                        : "Enter password"
                    }
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password {!editData && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: !editData ? "Please confirm password" : (changePassword ? "Please confirm password" : false),
                      validate: (value) => {
                        const password = getValues("password");
                        return value === password || "Passwords do not match";
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      editData
                        ? "Confirm new password"
                        : "Confirm password"
                    }
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Duty Type */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duty Type
              </label>
              <input
                {...register("duty_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Morning, Evening"
              />
            </div>

            {/* Duty Days */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Duty Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={day}
                      {...register("duty_days")}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {editData ? "Update Karkun" : "Create Karkun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

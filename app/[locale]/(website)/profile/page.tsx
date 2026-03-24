"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/services/auth-service";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showError, showSuccess } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhoneNumber(user?.phone_number || "");
    setPhotoPreview(user?.avatar || null);
  }, [user]);

  const initials = useMemo(() => {
    const source = user?.name || name || "User";
    const parts = source.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }, [user?.name, name]);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showError("Name and email are required");
      return;
    }

    try {
      setSavingProfile(true);
      await authService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
      });
      await refreshUser();
      showSuccess("Profile updated successfully");
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Please fill all password fields");
      return;
    }
    if (newPassword.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("New password and confirm password do not match");
      return;
    }

    try {
      setSavingPassword(true);
      await authService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Password updated successfully");
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Profile</h1>
        <p className="text-center text-gray-600 mt-2">
          Update your profile information, avatar, and password.
        </p>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your account&apos;s profile information and email address.
          </p>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-100 text-gray-600">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Current avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{initials}</span>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Camera size={14} />
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Upload a square image (512x512 pixels recommended)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">Use international format (e.g., +92 321 1234567)</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="mt-5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <h2 className="text-xl font-semibold text-gray-900">Update Password</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ensure your account is using a long, random password to stay secure.
          </p>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSavePassword}
            disabled={savingPassword}
            className="mt-5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {savingPassword ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

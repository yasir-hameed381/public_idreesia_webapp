"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { useTheme } from "@/context/useTheme";
import { Camera, Save, Trash2, Key, Copy, X, CheckCircle } from "lucide-react";

type TabType = "profile" | "password" | "appearance" | "api-tokens";

interface ApiToken {
  id: number;
  name: string;
  token?: string; // Only shown once when created
  last_used_at?: string;
  created_at: string;
}

const SettingsPage = () => {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // API Tokens state
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to update profile
      // await updateUser({ name, email, profile_photo: profilePhoto });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      setLoading(true);
      // TODO: Implement API call to change password
      // await changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password", error);
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setLoading(true);
      // Theme is already saved via setTheme in the context (saved to localStorage immediately)
      // Just show success message
      toast.success("Appearance settings saved");
    } catch (error: any) {
      console.error("Failed to save appearance", error);
      toast.error("Failed to save appearance settings");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // Theme is applied immediately via context, no need to save separately
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      setDeleting(true);
      // TODO: Implement API call to delete account
      toast.error("Account deletion is not yet implemented");
    } catch (error: any) {
      console.error("Failed to delete account", error);
      toast.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  // Load API tokens
  const loadApiTokens = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoadingTokens(true);
      // TODO: Implement API call to fetch tokens
      // const response = await apiClient.get('/api-tokens');
      // setTokens(response.data);
      setTokens([]); // Placeholder
    } catch (error: any) {
      console.error("Failed to load API tokens", error);
      toast.error("Failed to load API tokens");
    } finally {
      setLoadingTokens(false);
    }
  };

  // Create API token
  const handleCreateToken = async () => {
    if (!tokenName.trim()) {
      toast.error("Please enter a token name");
      return;
    }
    try {
      setCreatingToken(true);
      // TODO: Implement API call to create token
      // const response = await apiClient.post('/api-tokens', { name: tokenName });
      // setNewToken(response.data.token);
      // const newTokenObj: ApiToken = {
      //   id: response.data.id,
      //   name: tokenName,
      //   created_at: response.data.created_at,
      // };
      // setTokens([newTokenObj, ...tokens]);
      // setTokenName("");
      
      // Placeholder - simulate token creation with format matching screenshot
      const randomPart1 = Math.random().toString(36).substring(2, 15);
      const randomPart2 = Math.random().toString(36).substring(2, 15);
      const randomPart3 = Math.random().toString(36).substring(2, 15);
      const randomPart4 = Math.random().toString(36).substring(2, 15);
      const mockToken = `3|${randomPart1}${randomPart2}${randomPart3}${randomPart4}`;
      
      setNewToken(mockToken);
      const newTokenObj: ApiToken = {
        id: Date.now(),
        name: tokenName,
        created_at: new Date().toISOString(),
      };
      setTokens([newTokenObj, ...tokens]);
      setTokenName("");
    } catch (error: any) {
      console.error("Failed to create API token", error);
      toast.error(error?.response?.data?.message || "Failed to create API token");
    } finally {
      setCreatingToken(false);
    }
  };

  // Copy token to clipboard
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard");
  };

  // Delete API token
  const handleDeleteToken = async (tokenId: number) => {
    if (!confirm("Are you sure you want to delete this token? This action cannot be undone.")) {
      return;
    }
    try {
      // TODO: Implement API call to delete token
      // await apiClient.delete(`/api-tokens/${tokenId}`);
      setTokens(tokens.filter((t) => t.id !== tokenId));
      toast.success("Token deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete token", error);
      toast.error(error?.response?.data?.message || "Failed to delete token");
    }
  };

  // Load tokens when API Tokens tab is active
  useEffect(() => {
    if (activeTab === "api-tokens" && isSuperAdmin) {
      loadApiTokens();
    }
  }, [activeTab, isSuperAdmin]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your profile and account settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "password"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "appearance"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Appearance
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("api-tokens")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "api-tokens"
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  API Tokens
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile</h2>
                  <p className="text-sm text-gray-600">
                    Update your profile information and avatar
                  </p>
                </div>

                {/* Profile Photo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600 overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <Camera size={16} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Upload a square image (512x512 pixels recommended)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Password</h2>
                  <p className="text-sm text-gray-600">
                    Update your password to keep your account secure
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Appearance</h2>
                  <p className="text-sm text-gray-600">
                    Customize the appearance of your interface
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value as "light" | "dark" | "system")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {theme === "system" 
                      ? "Theme will match your system preference"
                      : `Theme is set to ${theme}`}
                  </p>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )}

            {/* API Tokens Tab */}
            {activeTab === "api-tokens" && isSuperAdmin && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">API Tokens</h2>
                  <p className="text-sm text-gray-600">
                    Manage your API tokens for external applications
                  </p>
                </div>

                {/* New Token Display - Success Box */}
                {newToken && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-green-900 mb-1">
                          API Token Created
                        </h3>
                        <p className="text-sm text-green-800">
                          Please copy your new API token. For security reasons, it won't be shown again.
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={newToken}
                        readOnly
                        className="w-full px-4 py-2 bg-white border border-green-300 rounded text-sm font-mono text-gray-900"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNewToken(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleCopyToken(newToken)}
                        className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Copy size={14} />
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                )}

                {/* Create New Token Form */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="API Token Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-2"
                  />
                  <p className="text-xs text-gray-500 mb-4">
                    Give your token a descriptive name for future reference.
                  </p>
                  <button
                    onClick={handleCreateToken}
                    disabled={creatingToken || !tokenName.trim()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creatingToken ? "Creating..." : "Create API Token"}
                  </button>
                </div>

                {/* Your API Tokens List */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Your API Tokens</h3>
                  {loadingTokens ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading tokens...
                    </div>
                  ) : tokens.length === 0 ? (
                    <div className="border border-gray-200 rounded-lg p-12 text-center bg-gray-50">
                      <Key size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="font-semibold text-gray-900 mb-2">No API Tokens</p>
                      <p className="text-sm text-gray-600">
                        You haven't created any API tokens yet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              NAME
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              LAST USED
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CREATED AT
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tokens.map((token) => {
                            const createdDate = new Date(token.created_at);
                            const now = new Date();
                            const diffSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
                            const diffMinutes = Math.floor(diffSeconds / 60);
                            const diffHours = Math.floor(diffMinutes / 60);
                            const diffDays = Math.floor(diffHours / 24);
                            
                            let timeAgo = "";
                            if (diffSeconds < 60) {
                              timeAgo = `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
                            } else if (diffMinutes < 60) {
                              timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                            } else if (diffHours < 24) {
                              timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                            } else {
                              timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                            }

                            return (
                              <tr key={token.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {token.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : "Never used"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {timeAgo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                  <button
                                    onClick={() => handleDeleteToken(token.id)}
                                    className="text-red-600 hover:text-red-700 font-medium"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete account</h2>
              <p className="text-sm text-gray-600">
                Delete your account and all of its resources
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;


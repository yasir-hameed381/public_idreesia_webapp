"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown,
} from "lucide-react";
import {
  useFetchAdminUsersQuery,
  useDeleteAdminUserMutation,
  AdminUser,
} from "../../../../../store/slicers/adminUserApi";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { useFetchAddressQuery } from "../../../../../store/slicers/mehfildirectoryApi";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

type TabType = "karkun" | "ehad_karkun" | "all_region_admin" | "region_admin" | "mehfil_admin" | "zone_admin";

interface KarkunanTableProps {
  onEdit: (user: AdminUser) => void;
  onAdd: () => void;
}

export function KarkunanTable({ onEdit, onAdd }: KarkunanTableProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [filteredData, setFilteredData] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("karkun");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"id" | "name" | "email" | "created_at">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleting, setDeleting] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
  const [selectedMehfilId, setSelectedMehfilId] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Fetch zones for filter dropdown
  const {
    data: zonesData,
    isLoading: zonesLoading,
    error: zonesError
  } = useFetchZonesQuery({
    page: 1,
    per_page: 1000,
  });

  // Fetch mehfils for filter dropdown (filtered by selected zone)
  const {
    data: mehfilsData,
    isLoading: mehfilsLoading,
    error: mehfilsError
  } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: selectedZoneId === "all" ? "" : String(selectedZoneId),
    search: "",
  });

  // Debug: Log API responses
  useEffect(() => {
    if (zonesError) {
      console.error("Error fetching zones:", zonesError);
    }
    if (mehfilsError) {
      console.error("Error fetching mehfils:", mehfilsError);
    }
    if (zonesData) {
      console.log("Zones data:", zonesData);
    }
    if (mehfilsData) {
      console.log("Mehfils data:", mehfilsData);
    }
  }, [zonesData, mehfilsData, zonesError, mehfilsError]);

  // Use server-side filtering and pagination (matching Laravel implementation)
  const effectivePage = currentPage;
  const effectiveSize = perPage;

  // Fetch admin users data using RTK Query with server-side filtering
  const {
    data: apiResponse,
    isLoading: loading,
    error: fetchError,
    refetch,
  } = useFetchAdminUsersQuery({
    page: effectivePage,
    size: effectiveSize,
    search: debouncedSearch.trim(),
    sortField,
    sortDirection,
    zone_id: selectedZoneId !== "all" ? selectedZoneId : null,
    mehfil_directory_id: selectedMehfilId !== "all" ? selectedMehfilId : null,
    activeTab: activeTab,
  });

  const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  // Reset to first page when search, tab, sort, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, sortField, sortDirection, selectedZoneId, selectedMehfilId]);

  // Update filtered data when API response changes (server-side filtering)
  useEffect(() => {
    if (!apiResponse?.data) {
      setFilteredData([]);
      return;
    }
    // Data is already filtered and sorted on the server
    // Ensure data is an array
    const dataArray = Array.isArray(apiResponse.data) ? apiResponse.data : [];
    setFilteredData(dataArray);

    // Debug logging
    if (dataArray.length > 0) {
      console.log("✅ Loaded users:", dataArray.length, "users");
      console.log("Sample user:", dataArray[0]);
    } else {
      console.log("⚠️ No users found in response");
    }
  }, [apiResponse]);

  const handleSortChange = (field: "id" | "name" | "email" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };


  const handleDeleteClick = (user: AdminUser) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_KARKUNS))) {
      showError("You don't have permission to delete karkuns");
      return;
    }
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    if (!(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_KARKUNS))) {
      showError("You don't have permission to delete karkuns");
      setShowDeleteDialog(false);
      setSelectedUser(null);
      return;
    }

    try {
      setDeleting(true);
      await deleteAdminUser(selectedUser.id).unwrap();
      showSuccess("User deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedUser(null);
      // RTK Query will automatically refetch due to invalidated tags
      await refetch();
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || "Failed to delete user. Please try again.";
      showError(errorMessage);
      console.error("Error deleting user:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_KARKUNS))) {
      showError("You don't have permission to edit karkuns");
      return;
    }
    if (onEdit) {
      onEdit(user);
    }
  };

  const handleView = (user: AdminUser) => {
    // Navigate to detail page if it exists
    // router.push(`/${locale}/karkuns/${user.id}`);
  };

  // Helper function to get display name for tabs
  const getTabDisplayName = (tab: TabType) => {
    switch (tab) {
      case "karkun":
        return "Karkun";
      case "ehad_karkun":
        return "Ehad Karkun";
      case "zone_admin":
        return "Zone Admin";
      case "mehfil_admin":
        return "Mehfil Admin";
      case "all_region_admin":
        return "All Region Admin";
      case "region_admin":
        return "Region Admin";
      default:
        return "User";
    }
  };

  // Helper function to get karkun_id (zone_id-id format)
  const getKarkunId = (user: AdminUser): string => {
    return `${user.zone_id || 0}-${user.id}`;
  };

  // Helper function to get user initials
  const getInitials = (name: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Helper function to format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (avatar: string | null | undefined): string | null => {
    if (!avatar) return null;
    // If already a full URL, return as is
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    // Otherwise, construct URL (adjust based on your S3 setup)
    return avatar;
  };

  // Reset mehfil filter when zone changes
  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setSelectedMehfilId("all"); // Reset mehfil filter when zone changes
  };


  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Use server-side pagination data
  const totalFilteredCount = apiResponse?.meta?.total || 0;
  const totalPages = apiResponse?.meta?.last_page || 1;
  const from = apiResponse?.meta?.from || 0;
  const to = apiResponse?.meta?.to || 0;
  const currentTotal = totalFilteredCount;

  // Permission checks
  const canEditKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_KARKUNS);
  const canDeleteKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_KARKUNS);
  const canCreateKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_KARKUNS);

  // Debug logging for API response
  useEffect(() => {
    if (apiResponse) {
      console.log("📦 API Response:", {
        dataLength: apiResponse.data?.length || 0,
        meta: apiResponse.meta,
        hasData: !!apiResponse.data,
      });
    }
    if (fetchError) {
      console.error("❌ Fetch Error:", fetchError);
    }
  }, [apiResponse, fetchError]);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading data
            </div>
            <p className="text-gray-600 mt-2">
              {(fetchError as { data?: { message?: string }; message?: string })
                .data?.message ??
                (fetchError as { message?: string }).message ??
                "Please try refreshing the page"}
              {(fetchError as any)?.data?.message || (fetchError as any)?.message || "Please try refreshing the page"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Karkuns</h1>
            <p className="text-gray-600 mt-1">Manage karkuns accounts</p>
          </div>
          <div>
            {canCreateKarkuns && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Plus size={16} />
                Create Karkun
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-8 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("karkun")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "karkun"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Karkuns
            </button>
            <button
              onClick={() => setActiveTab("ehad_karkun")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "ehad_karkun"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Ehad Karkuns
            </button>
            <button
              onClick={() => setActiveTab("all_region_admin")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "all_region_admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              All Region Admin
            </button>
            <button
              onClick={() => setActiveTab("region_admin")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "region_admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Region Admin
            </button>
            <button
              onClick={() => setActiveTab("mehfil_admin")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "mehfil_admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Mehfil Admin
            </button>
            <button
              onClick={() => setActiveTab("zone_admin")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === "zone_admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Zone Admin
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between flex-wrap">
              {/* Search */}
              <div className="relative w-full md:w-1/3">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${getTabDisplayName(
                    activeTab
                  ).toLowerCase()}s...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters Row */}
              <div className="flex gap-4 items-center justify-end w-full md:w-auto">
                <div className="relative w-full md:w-48">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    disabled={zonesLoading}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Zones</option>
                    {zonesLoading ? (
                      <option value="">Loading zones...</option>
                    ) : zonesError ? (
                      <option value="">Error loading zones</option>
                    ) : (
                      zonesData?.data?.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.title_en || zone.id}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="relative w-full md:w-48">
                  <select
                    value={selectedMehfilId}
                    onChange={(e) => setSelectedMehfilId(e.target.value)}
                    disabled={selectedZoneId === "all" || mehfilsLoading}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Mehfils</option>
                    {mehfilsLoading ? (
                      <option value="">Loading mehfils...</option>
                    ) : mehfilsError ? (
                      <option value="">Error loading mehfils</option>
                    ) : (
                      mehfilsData?.data?.map((mehfil: any) => (
                        <option key={mehfil.id} value={mehfil.id}>
                          {mehfil.name_en || mehfil.name || mehfil.id}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="relative w-full md:w-auto">
                  <select
                    value={perPage}
                    onChange={(e) =>
                      handlePerPageChange(Number(e.target.value))
                    }
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Karkun ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avatar
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Name (English)</span>
                          {sortField === "name" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name (Urdu)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name (English)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name (Urdu)
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("email")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Email</span>
                          {sortField === "email" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Affidavit Form
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mehfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birth Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ehad Year
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("created_at")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Created At</span>
                          {sortField === "created_at" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated By
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={20} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <User className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No {getTabDisplayName(activeTab).toLowerCase()}s found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first{" "}
                              {getTabDisplayName(activeTab).toLowerCase()}.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((user: AdminUser) => {
                        const avatarUrl = getAvatarUrl(user.avatar);
                        const initials = getInitials(user.name);
                        const karkunId = getKarkunId(user);
                        const fullAddress = [user.address, user.city, user.country]
                          .filter(Boolean)
                          .join(" ") || "—";

                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {karkunId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={user.name}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium ring-1 ring-primary-300/30">
                                  {initials}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td dir="rtl" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.name_ur || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.father_name || "—"}
                            </td>
                            <td dir="rtl" className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.father_name_ur || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.phone_number || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.is_active ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.has_affidavit_form ? (
                                <button
                                  onClick={() => {
                                    if (user.affidavit_form_file) {
                                      // Handle affidavit form view - adjust URL based on your setup
                                      window.open(user.affidavit_form_file, "_blank");
                                    }
                                  }}
                                  className="inline-block"
                                >
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                                    Yes
                                  </span>
                                </button>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.is_all_region_admin
                                ? "All Region Admin"
                                : user.is_region_admin
                                  ? "Region Admin"
                                  : user.is_zone_admin
                                    ? "Zone Admin"
                                    : user.is_mehfil_admin
                                      ? "Mehfil Admin"
                                      : "Karkun"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.zone?.title_en || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.mehfilDirectory?.name_en || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {fullAddress}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.birth_year || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.ehad_year || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.creator?.name || (user.created_by ? `User ${user.created_by}` : "—")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.updater?.name || (user.updated_by ? `User ${user.updated_by}` : "—")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end">
                                <ActionsDropdown
                                  onView={() => handleView(user)}
                                  onEdit={() => handleEdit(user)}
                                  onDelete={canDeleteKarkuns ? () => handleDeleteClick(user) : undefined}
                                  showView={false}
                                  showEdit={canEditKarkuns}
                                  showDelete={canDeleteKarkuns}
                                  align="right"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {from} to {to} of {currentTotal} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTablePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleTablePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handleTablePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}" (ID: ${selectedUser?.id})? This action cannot be undone.`}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}

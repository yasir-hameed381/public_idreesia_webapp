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

type TabType = "karkuns" | "ehad-karkuns" | "zone-admin" | "mehfil-admin" | "all-region-admin" | "region-admin";

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
  const [activeTab, setActiveTab] = useState<TabType>("karkuns");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"id" | "name" | "created_at">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleting, setDeleting] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("all");
  const [selectedMehfilId, setSelectedMehfilId] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Fetch zones for filter dropdown
  const { data: zonesData } = useFetchZonesQuery({
    page: 1,
    per_page: 1000,
  });

  // Fetch mehfils for filter dropdown (filtered by selected zone)
  const { data: mehfilsData } = useFetchAddressQuery({
    page: 1,
    size: 1000,
    zoneId: selectedZoneId === "all" ? "" : selectedZoneId,
    search: "",
  });

  // Calculate effective page size - if filters are active, fetch more data for proper filtering
  const hasActiveFilters = selectedZoneId !== "all" || selectedMehfilId !== "all";
  const effectiveSize = hasActiveFilters ? 1000 : perPage; // Fetch more when filtering

  // Fetch all admin users data using RTK Query
  const {
    data: apiResponse,
    isLoading: loading,
    error: fetchError,
    refetch,
  } = useFetchAdminUsersQuery({
    page: hasActiveFilters ? 1 : currentPage, // Always fetch page 1 when filtering, then paginate filtered results
    size: effectiveSize,
    search: debouncedSearch.trim(),
    sortField,
    sortDirection,
  });

  const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  // Reset to first page when search, tab, sort, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, sortField, sortDirection, selectedZoneId, selectedMehfilId]);

  // Filter and sort data based on active tab and filters
  useEffect(() => {
    if (!apiResponse?.data) {
      setFilteredData([]);
      return;
    }

    let filtered = [...apiResponse.data];

    // Apply tab filter
    switch (activeTab) {
      case "karkuns":
        filtered = apiResponse.data.filter(
          (user) =>
            !user.is_zone_admin &&
            !user.is_mehfil_admin &&
            !user.is_region_admin &&
            !user.is_all_region_admin &&
            (user.user_type === "karkun" || !user.user_type)
        );
        break;
      case "ehad-karkuns":
        filtered = apiResponse.data.filter(
          (user) =>
            user.user_type === "ehad_karkun" || user.user_type === "ehad-karkun"
        );
        break;
      case "zone-admin":
        filtered = apiResponse.data.filter(
          (user) => user.is_zone_admin === true
        );
        break;
      case "mehfil-admin":
        filtered = apiResponse.data.filter(
          (user) => user.is_mehfil_admin === true
        );
        break;
      case "all-region-admin":
        filtered = apiResponse.data.filter(
          (user) => user.is_all_region_admin === true
        );
        break;
      case "region-admin":
        filtered = apiResponse.data.filter(
          (user) => user.is_region_admin === true && !user.is_all_region_admin
        );
        break;
      default:
        break;
    }

    // Apply zone filter
    if (selectedZoneId !== "all" && selectedZoneId) {
      const zoneIdNum = Number(selectedZoneId);
      const zoneIdStr = selectedZoneId;
      filtered = filtered.filter((user) => {
        // Handle both string and number comparisons
        if (user.zone_id === null || user.zone_id === undefined) {
          return false;
        }
        // Compare as both number and string to handle type mismatches
        return (
          user.zone_id === zoneIdNum ||
          user.zone_id === zoneIdStr ||
          user.zone_id.toString() === zoneIdStr ||
          user.zone_id.toString() === zoneIdNum.toString()
        );
      });
    }

    // Apply mehfil filter
    if (selectedMehfilId !== "all" && selectedMehfilId) {
      const mehfilIdNum = Number(selectedMehfilId);
      const mehfilIdStr = selectedMehfilId;
      filtered = filtered.filter((user) => {
        // Handle both string and number comparisons
        if (user.mehfil_directory_id === null || user.mehfil_directory_id === undefined) {
          return false;
        }
        // Compare as both number and string to handle type mismatches
        return (
          user.mehfil_directory_id === mehfilIdNum ||
          user.mehfil_directory_id === mehfilIdStr ||
          user.mehfil_directory_id.toString() === mehfilIdStr ||
          user.mehfil_directory_id.toString() === mehfilIdNum.toString()
        );
      });
    }

    // Client-side sorting
    filtered = getSortedData(filtered);
    
    // If filters are active, paginate the filtered results client-side
    if (hasActiveFilters && filtered.length > 0) {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      filtered = filtered.slice(startIndex, endIndex);
    }
    
    setFilteredData(filtered);
  }, [apiResponse, activeTab, sortField, sortDirection, selectedZoneId, selectedMehfilId, currentPage, perPage, hasActiveFilters]);

  const handleSortChange = (field: "id" | "name" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  // Client-side sorting function
  const getSortedData = (data: AdminUser[]) => {
    if (!data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      
      // Handle number comparison (for ID)
      if (sortField === "id") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle date comparison
      if (sortField === "created_at") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
      
      // Convert to string and compare
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
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
      case "karkuns":
        return "Karkun";
      case "ehad-karkuns":
        return "Ehad Karkun";
      case "zone-admin":
        return "Zone Admin";
      case "mehfil-admin":
        return "Mehfil Admin";
      case "all-region-admin":
        return "All Region Admin";
      case "region-admin":
        return "Region Admin";
      default:
        return "User";
    }
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

  // Calculate pagination based on filtered data when filters are active
  const totalFilteredCount = hasActiveFilters && apiResponse?.data 
    ? (() => {
        let count = [...apiResponse.data];
        
        // Apply tab filter
        switch (activeTab) {
          case "karkuns":
            count = count.filter(
              (user) =>
                !user.is_zone_admin &&
                !user.is_mehfil_admin &&
                !user.is_region_admin &&
                !user.is_all_region_admin &&
                (user.user_type === "karkun" || !user.user_type)
            );
            break;
          case "ehad-karkuns":
            count = count.filter(
              (user) =>
                user.user_type === "ehad_karkun" || user.user_type === "ehad-karkun"
            );
            break;
          case "zone-admin":
            count = count.filter((user) => user.is_zone_admin === true);
            break;
          case "mehfil-admin":
            count = count.filter((user) => user.is_mehfil_admin === true);
            break;
          case "all-region-admin":
            count = count.filter((user) => user.is_all_region_admin === true);
            break;
          case "region-admin":
            count = count.filter(
              (user) => user.is_region_admin === true && !user.is_all_region_admin
            );
            break;
        }
        
        // Apply zone filter
        if (selectedZoneId !== "all" && selectedZoneId) {
          const zoneIdNum = Number(selectedZoneId);
          const zoneIdStr = selectedZoneId;
          count = count.filter((user) => {
            if (user.zone_id === null || user.zone_id === undefined) return false;
            return (
              user.zone_id === zoneIdNum ||
              user.zone_id === zoneIdStr ||
              user.zone_id.toString() === zoneIdStr ||
              user.zone_id.toString() === zoneIdNum.toString()
            );
          });
        }
        
        // Apply mehfil filter
        if (selectedMehfilId !== "all" && selectedMehfilId) {
          const mehfilIdNum = Number(selectedMehfilId);
          const mehfilIdStr = selectedMehfilId;
          count = count.filter((user) => {
            if (user.mehfil_directory_id === null || user.mehfil_directory_id === undefined) return false;
            return (
              user.mehfil_directory_id === mehfilIdNum ||
              user.mehfil_directory_id === mehfilIdStr ||
              user.mehfil_directory_id.toString() === mehfilIdStr ||
              user.mehfil_directory_id.toString() === mehfilIdNum.toString()
            );
          });
        }
        
        return count.length;
      })()
    : apiResponse?.meta?.total || 0;

  const totalPages = hasActiveFilters 
    ? Math.ceil(totalFilteredCount / perPage)
    : apiResponse?.meta?.last_page || 1;
  
  const from = hasActiveFilters
    ? (currentPage - 1) * perPage + 1
    : apiResponse?.meta?.from || 0;
  
  const to = hasActiveFilters
    ? Math.min(currentPage * perPage, totalFilteredCount)
    : apiResponse?.meta?.to || 0;
  
  const currentTotal = totalFilteredCount;

  // Permission checks
  const canEditKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_KARKUNS);
  const canDeleteKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_KARKUNS);
  const canCreateKarkuns = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_KARKUNS);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading data
            </div>
            <p className="text-gray-600 mt-2">Please try refreshing the page</p>
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
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("karkuns")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "karkuns"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Karkuns
            </button>
            <button
              onClick={() => setActiveTab("ehad-karkuns")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "ehad-karkuns"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Ehad Karkuns
            </button>
            <button
              onClick={() => setActiveTab("zone-admin")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "zone-admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Zone Admin
            </button>
            <button
              onClick={() => setActiveTab("mehfil-admin")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "mehfil-admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Mehfil Admin
            </button>
            <button
              onClick={() => setActiveTab("all-region-admin")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "all-region-admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Region Admin
            </button>
            <button
              onClick={() => setActiveTab("region-admin")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "region-admin"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Region Admin
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* First Row: Search and Per Page */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative max-w-sm w-full">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <div className="relative">
                    <select
                      value={perPage}
                      onChange={(e) =>
                        handlePerPageChange(Number(e.target.value))
                      }
                      className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
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
              
              {/* Second Row: Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48"
                  >
                    <option value="all">All Zones</option>
                    {zonesData?.data?.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.title_en || zone.id}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedMehfilId}
                    onChange={(e) => setSelectedMehfilId(e.target.value)}
                    disabled={selectedZoneId === "all"}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Mehfils</option>
                    {mehfilsData?.data?.map((mehfil: any) => (
                      <option key={mehfil.id} value={mehfil.id}>
                        {mehfil.name_en || mehfil.name || mehfil.id}
                      </option>
                    ))}
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
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("id")}
                      >
                        <div className="flex items-center gap-2">
                          <span>User ID</span>
                          {sortField === "id" && (
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
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("name")}
                      >
                        <div className="flex items-center gap-2">
                          <span>Name</span>
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
                        Father Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Type
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
                        <div className="flex items-center gap-2">
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <User className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No {getTabDisplayName(activeTab).toLowerCase()}s
                              found
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first{" "}
                              {getTabDisplayName(activeTab).toLowerCase()}.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((user: AdminUser) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </span>
                                {user.name_ur && (
                                  <span className="text-xs text-gray-500">
                                    {user.name_ur}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">
                                {user.father_name || "N/A"}
                              </span>
                              {user.father_name_ur && (
                                <span className="text-xs text-gray-500">
                                  {user.father_name_ur}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.phone_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.is_super_admin
                                  ? "bg-red-100 text-red-800"
                                  : user.is_zone_admin
                                  ? "bg-purple-100 text-purple-800"
                                  : user.is_mehfil_admin
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.is_super_admin
                                ? "Super Admin"
                                : user.is_zone_admin
                                ? "Zone Admin"
                                : user.is_mehfil_admin
                                ? "Mehfil Admin"
                                : "Karkun"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {user.user_type || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="text-sm text-gray-900 max-w-xs truncate"
                              title={user.address || "No address"}
                            >
                              {user.address || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.birth_year || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.ehad_year || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-end">
                              <ActionsDropdown
                                onView={() => handleView(user)}
                                onEdit={() => handleEdit(user)}
                                onDelete={canDeleteKarkuns ? () => handleDeleteClick(user) : undefined}
                                showView={true}
                                showEdit={canEditKarkuns}
                                showDelete={canDeleteKarkuns}
                                align="right"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
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
                                className={`px-3 py-1 rounded-md text-sm ${
                                  currentPage === pageNum
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

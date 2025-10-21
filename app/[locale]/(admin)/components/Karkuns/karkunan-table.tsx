"use client";
import { useEffect, useState } from "react";
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
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";

type TabType = "karkuns" | "ehad-karkuns" | "zone-admin" | "mehfil-admin";

interface UserData {
  id: number;
  zone_id: number | null;
  name: string;
  name_ur: string | null;
  email: string;
  father_name: string | null;
  father_name_ur: string | null;
  phone_number: string | null;
  id_card_number: string | null;
  address: string | null;
  birth_year: number | null;
  ehad_year: number | null;
  mehfil_directory_id: number | null;
  duty_days: string | null;
  duty_type: string | null;
  avatar: string;
  city: string | null;
  country: string | null;
  is_zone_admin: boolean;
  is_mehfil_admin: boolean;
  is_super_admin: boolean;
  role_id: number | null;
  user_type: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: UserData[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: string;
    to: number;
    total: number;
  };
}

interface KarkunanTableProps {
  onEdit: (user: UserData) => void;
  onAdd: () => void;
}

export function KarkunanTable({ onEdit, onAdd }: KarkunanTableProps) {
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("karkuns");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Function to refresh data
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch all admin users data
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await AdminUsersService.getAll({
          page: currentPage,
          size: perPage,
          search: debouncedSearch.trim(),
        });

        setApiResponse(response);
      } catch (err) {
        setError("Failed to load users data");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [debouncedSearch, currentPage, perPage, refreshTrigger]);

  // Filter data based on active tab
  useEffect(() => {
    if (!apiResponse?.data) {
      setFilteredData([]);
      return;
    }

    let filtered = [...apiResponse.data];

    switch (activeTab) {
      case "karkuns":
        filtered = apiResponse.data.filter(
          (user) =>
            !user.is_zone_admin &&
            !user.is_mehfil_admin &&
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
      default:
        break;
    }

    setFilteredData(filtered);
  }, [apiResponse, activeTab]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await AdminUsersService.delete(selectedUser.id);
      showSuccess("User deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedUser(null);
      refreshData();
    } catch {
      showError("Failed to delete user.");
    }
  };

  // Handle edit button click
  const handleEditClick = (user: UserData) => {
    onEdit(user);
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
      default:
        return "User";
    }
  };

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const confirmDelete = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Use API meta data for pagination
  const totalPages = apiResponse?.meta?.last_page || 1;
  const currentTotal = apiResponse?.meta?.total || 0;
  const from = apiResponse?.meta?.from || 0;
  const to = apiResponse?.meta?.to || 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading data
            </div>
            <p className="text-gray-600 mt-2">Please try refreshing the page</p>
            <button
              onClick={refreshData}
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
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Plus size={16} />
              Add Karkun
            </button>
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
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
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
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      filteredData.map((user: UserData) => (
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
                            <div className="flex items-center gap-2">
                              {(isSuperAdmin ||
                                hasPermission(PERMISSIONS.EDIT_KARKUNAN)) && (
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(isSuperAdmin ||
                                hasPermission(PERMISSIONS.DELETE_KARKUNAN)) && (
                                <button
                                  onClick={() => confirmDelete(user)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
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
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name}</strong>? This will permanently
              remove their record from the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

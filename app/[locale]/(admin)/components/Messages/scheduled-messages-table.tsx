"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  useGetMessageSchedulesQuery,
  useDeleteMessageScheduleMutation,
} from "@/store/slicers/messageSchedulesApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import ActionsDropdown from "@/components/ActionsDropdown";

export function ScheduledMessagesTable() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"next_run_at" | "scheduled_at" | "last_sent_at" | "repeat" | "message.title_en" | "message.title_ur">("next_run_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { showError, showSuccess } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  // RTK Query hook
  const { data, error, isLoading, isFetching, refetch } =
    useGetMessageSchedulesQuery(
      {
        page: currentPage,
        size: perPage,
      },
      {
        refetchOnMountOrArgChange: true,
      }
    );

  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteMessageScheduleMutation();

  // Permission checks
  const canViewMessages = isSuperAdmin || hasPermission(PERMISSIONS.VIEW_MESSAGES);
  const canEditMessages = isSuperAdmin || hasPermission(PERMISSIONS.EDIT_MESSAGES);
  const canDeleteMessages = isSuperAdmin || hasPermission(PERMISSIONS.DELETE_MESSAGES);
  const canCreateMessages = isSuperAdmin || hasPermission(PERMISSIONS.CREATE_MESSAGES);

  // Show error notification
  useEffect(() => {
    if (error) {
      showError("Failed to load scheduled messages. Please try again.");
    }
  }, [error]);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDirection]);

  // Client-side sorting and filtering
  const getFilteredAndSortedData = (data: any[]) => {
    if (!data || data.length === 0) return data;

    // Filter by search term (message title)
    let filtered = data;
    if (debouncedSearch) {
      filtered = data.filter((item) => {
        const messageTitleEn = item.message?.title_en || "";
        const messageTitleUr = item.message?.title_ur || "";
        const searchLower = debouncedSearch.toLowerCase();
        return (
          messageTitleEn.toLowerCase().includes(searchLower) ||
          messageTitleUr.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort data
    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField.startsWith("message.")) {
        const field = sortField.replace("message.", "");
        aValue = a.message?.[field] || "";
        bValue = b.message?.[field] || "";
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle date comparison
      if (sortField === "next_run_at" || sortField === "scheduled_at" || sortField === "last_sent_at") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Convert to string and compare
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const handleSortChange = (field: "next_run_at" | "scheduled_at" | "last_sent_at" | "repeat" | "message.title_en" | "message.title_ur") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: "next_run_at" | "scheduled_at" | "last_sent_at" | "repeat" | "message.title_en" | "message.title_ur") => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-gray-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-gray-600" />
    );
  };

  // Handle view message - navigate to message edit page
  const handleViewMessage = (schedule: any) => {
    if (!canViewMessages) {
      showError("You don't have permission to view messages.");
      return;
    }
    if (!schedule.message_id) {
      showError("Message ID is missing for this schedule.");
      return;
    }
    // Navigate to message edit page
    router.push(`/${locale}/messages/${schedule.message_id}/edit`);
  };

  // Handle edit
  const handleEdit = (schedule: any) => {
    if (!canEditMessages) {
      showError("You don't have permission to edit scheduled messages.");
      return;
    }
    if (!schedule.message_id) {
      showError("Message ID is missing for this schedule.");
      return;
    }
    router.push(`/${locale}/messages/schedule/${schedule.message_id}/${schedule.id}`);
  };

  // Handle delete click
  const handleDeleteClick = (schedule: any) => {
    if (!canDeleteMessages) {
      showError("You don't have permission to delete scheduled messages.");
      return;
    }
    setSelectedSchedule(schedule);
    setShowDeleteDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteSchedule(selectedSchedule.id).unwrap();
      showSuccess("Message schedule deleted successfully");
      setShowDeleteDialog(false);
      setSelectedSchedule(null);
      refetch();
    } catch (error) {
      showError("Failed to delete schedule. Please try again.");
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Status template
  const statusTemplate = (rowData: any) => {
    const isActive = rowData.is_active === true || rowData.is_active === 1;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Mobile notification template
  const mobileNotificationTemplate = (rowData: any) => {
    const isEnabled = rowData.send_to_mobile_devices === true || rowData.send_to_mobile_devices === 1;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isEnabled
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isEnabled ? "Enabled" : "Disabled"}
      </span>
    );
  };

  // Repeat template with day badges
  const repeatTemplate = (schedule: any) => {
    if (schedule.repeat === "no-repeat") {
      return <span className="text-sm text-gray-900">No Repeat</span>;
    }

    const repeatLabel = schedule.repeat.charAt(0).toUpperCase() + schedule.repeat.slice(1);
    const days = [
      { key: "monday", label: "Mon" },
      { key: "tuesday", label: "Tue" },
      { key: "wednesday", label: "Wed" },
      { key: "thursday", label: "Thu" },
      { key: "friday", label: "Fri" },
      { key: "saturday", label: "Sat" },
      { key: "sunday", label: "Sun" },
    ];

    const selectedDays = days.filter((day) => schedule[day.key] === true || schedule[day.key] === 1);

    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-900">{repeatLabel}</span>
        {selectedDays.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {selectedDays.map((day) => (
              <span
                key={day.key}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {day.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get filtered and sorted data
  const sortedData = data?.data ? getFilteredAndSortedData(data.data) : [];
  const totalPages = Math.ceil((data?.meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(startRecord + perPage - 1, data?.meta?.total || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scheduled Messages</h1>
              <p className="text-gray-600 mt-1">
                Manage message schedules and delivery times
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/messages`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Messages
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search scheduled messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found {sortedData?.length || 0} results
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Records Per Page Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("message.title_en")}
                  >
                    <div className="flex items-center gap-1">
                      TITLE (EN)
                      {getSortIcon("message.title_en")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("message.title_ur")}
                  >
                    <div className="flex items-center gap-1">
                      TITLE (UR)
                      {getSortIcon("message.title_ur")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("scheduled_at")}
                  >
                    <div className="flex items-center gap-1">
                      SCHEDULED AT
                      {getSortIcon("scheduled_at")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("last_sent_at")}
                  >
                    <div className="flex items-center gap-1">
                      LAST SENT AT
                      {getSortIcon("last_sent_at")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("repeat")}
                  >
                    <div className="flex items-center gap-1">
                      REPEAT
                      {getSortIcon("repeat")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSortChange("next_run_at")}
                  >
                    <div className="flex items-center gap-1">
                      NEXT RUN
                      {getSortIcon("next_run_at")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOBILE NOTIFICATION
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED BY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPDATED BY
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData?.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                      No scheduled messages found
                    </td>
                  </tr>
                ) : (
                  sortedData?.map((schedule, index) => (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-gray-50 ${
                        index === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 min-w-xs">
                        {schedule.message?.title_en || "N/A"}
                      </td>
                      <td dir="rtl" className="px-6 py-4 text-sm text-gray-900 text-right min-w-xs">
                        {schedule.message?.title_ur || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.scheduled_at
                          ? format(new Date(schedule.scheduled_at), "dd MMM yyyy - hh:mm a")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.last_sent_at
                          ? format(new Date(schedule.last_sent_at), "dd MMM yyyy - hh:mm a")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {repeatTemplate(schedule)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.next_run_at
                          ? format(new Date(schedule.next_run_at), "dd MMM yyyy - hh:mm a")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusTemplate(schedule)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mobileNotificationTemplate(schedule)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.createdBy?.name || schedule.created_by_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.updatedBy?.name || schedule.updated_by_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionsDropdown
                          onView={canViewMessages ? () => handleViewMessage(schedule) : undefined}
                          onEdit={canEditMessages ? () => handleEdit(schedule) : undefined}
                          onDelete={canDeleteMessages ? () => handleDeleteClick(schedule) : undefined}
                          showView={canViewMessages}
                          showEdit={canEditMessages}
                          showDelete={canDeleteMessages}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startRecord}</span> to{" "}
                  <span className="font-medium">{endRecord}</span> of{" "}
                  <span className="font-medium">{data?.meta?.total || 0}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 10) {
                      pageNum = i + 1;
                    } else if (currentPage <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 4) {
                      pageNum = totalPages - 9 + i;
                    } else {
                      pageNum = currentPage - 4 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-gray-900 border-gray-900 text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 10 && currentPage < totalPages - 4 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        {totalPages - 1}
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Scheduled Message"
          message={`Are you sure you want to delete this scheduled message? This action cannot be undone.`}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedSchedule(null);
          }}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}


"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Calendar,
  Copy,
} from "lucide-react";
import {
  useFetchMessagesDataQuery,
  useDeleteMessageMutation,
} from "@/store/slicers/messagesApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { MessagesForm } from "./messages-form";

export function MessagesTable() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { showError, showSuccess } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  // RTK Query hook
  const { data, error, isLoading, isFetching, refetch } =
    useFetchMessagesDataQuery({
      page: currentPage,
      size: perPage,
      search: debouncedSearch,
    });

  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();

  // Show error notification
  useEffect(() => {
    if (error) {
      showError("Failed to load messages data. Please try again.");
    }
  }, [error]);

  // Handle edit
  const onEdit = (message: any) => {
    setSelectedMessage(message);
    setShowForm(true);
  };

  // Handle add
  const onAdd = () => {
    setSelectedMessage(null);
    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = (refresh = false) => {
    setShowForm(false);
    setSelectedMessage(null);
  };

  // Handle form success (refresh data)
  const handleFormSuccess = () => {
    refetch(); // Refresh the table data
  };

  // Handle delete confirmation
  const confirmDelete = (message: any) => {
    setSelectedMessage(message);
    setShowDeleteDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMessage) return;

    try {
      await deleteMessage(selectedMessage.id).unwrap();
      showSuccess("Message deleted successfully");
      setShowDeleteDialog(false);
      setSelectedMessage(null);
      refetch(); // Refresh the table data after deletion
    } catch (error) {
      showError("Failed to delete message. Please try again.");
    }
  };

  // Handle schedule message
  const onSchedule = (message: any) => {
    // TODO: Implement schedule message functionality
    showSuccess("Schedule message functionality will be implemented");
  };

  // Handle duplicate message
  const onDuplicate = (message: any) => {
    // Create a copy of the message with modified title
    const duplicatedMessage = {
      ...message,
      id: undefined, // Remove ID so it creates a new message
      title_en: `${message.title_en} (Copy)`,
      title_ur: `${message.title_ur} (Copy)`,
      slug: `${message.slug}-copy-${Date.now()}`,
    };
    setSelectedMessage(duplicatedMessage);
    setShowForm(true);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Status template
  const statusTemplate = (rowData: any) => {
    const isPublished =
      rowData.is_published === 1 || rowData.is_published === "1";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPublished
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </span>
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

  // Form modal
  if (showForm) {
    return (
      <MessagesForm
        onClose={handleCloseForm}
        initialData={selectedMessage}
        onSuccess={handleFormSuccess}
      />
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Manage messages and their details
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  /* Handle scheduled messages */
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Clock size={16} />
                Scheduled Messages
              </button>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Message
              </button>
            </div>
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
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found {data?.data?.length || 0}{" "}
                  results
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TITLE (EN)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TITLE (UR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      CREATED AT
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.map((message, index) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-gray-50 ${
                      index === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {message.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="line-clamp-2">{message.title_en}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="line-clamp-2">{message.title_ur}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusTemplate(message)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(
                        new Date(message.created_at),
                        "dd MMM yyyy - hh:mm a"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(message)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit message"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onSchedule(message)}
                          className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50 transition-colors"
                          title="Schedule message"
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => onDuplicate(message)}
                          className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                          title="Duplicate message"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(message)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                          disabled={isDeleting}
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                  <span className="font-medium">{data?.meta?.total || 0}</span>{" "}
                  results
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
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Delete Message
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this message? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setSelectedMessage(null);
                    }}
                    className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

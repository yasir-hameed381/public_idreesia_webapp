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
  CheckCircle,
  XCircle,
  Copy,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Building,
} from "lucide-react";
import {
  useFetchKarkunJoinRequestsDataQuery,
  useDeleteKarkunJoinRequestMutation,
  useApproveKarkunJoinRequestMutation,
} from "@/store/slicers/karkunJoinRequestsApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { KarkunJoinRequestForm } from "./karkun-join-request-form";

export function KarkunJoinRequestTable() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState<boolean | null>(null);
  const { showError, showSuccess } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  // RTK Query hook
  const { data, error, isLoading, isFetching, refetch } =
    useFetchKarkunJoinRequestsDataQuery({
      page: currentPage,
      size: perPage,
      search: debouncedSearch,
      user_type: userTypeFilter,
      is_approved: approvalFilter === null ? undefined : approvalFilter,
    });

  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteKarkunJoinRequestMutation();
  const [approveRequest, { isLoading: isApproving }] =
    useApproveKarkunJoinRequestMutation();

  // Show error notification
  useEffect(() => {
    if (error) {
      showError("Failed to load karkun join requests data. Please try again.");
    }
  }, [error]);

  // Handle edit
  const onEdit = (request: any) => {
    setSelectedRequest(request);
    setShowForm(true);
  };

  // Handle add
  const onAdd = () => {
    setSelectedRequest(null);
    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = (refresh = false) => {
    setShowForm(false);
    setSelectedRequest(null);
  };

  // Handle form success (refresh data)
  const handleFormSuccess = () => {
    refetch(); // Refresh the table data
  };

  // Handle delete confirmation
  const confirmDelete = (request: any) => {
    setSelectedRequest(request);
    setShowDeleteDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      await deleteRequest(selectedRequest.id).unwrap();
      showSuccess("Karkun join request deleted successfully");
      setShowDeleteDialog(false);
      setSelectedRequest(null);
      refetch(); // Refresh the table data after deletion
    } catch (error) {
      showError("Failed to delete karkun join request. Please try again.");
    }
  };

  // Handle approve/reject
  const handleApproval = async (request: any, isApproved: boolean) => {
    try {
      await approveRequest({
        id: request.id,
        is_approved: isApproved,
      }).unwrap();
      showSuccess(
        `Karkun join request ${
          isApproved ? "approved" : "rejected"
        } successfully`
      );
      refetch(); // Refresh the table data
    } catch (error) {
      showError(
        `Failed to ${
          isApproved ? "approve" : "reject"
        } karkun join request. Please try again.`
      );
    }
  };

  // Handle duplicate request
  const onDuplicate = (request: any) => {
    // Create a copy of the request with modified name
    const duplicatedRequest = {
      ...request,
      id: undefined, // Remove ID so it creates a new request
      first_name: `${request.first_name} (Copy)`,
      last_name: `${request.last_name} (Copy)`,
      email: `copy_${request.email}`,
    };
    setSelectedRequest(duplicatedRequest);
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
    const isApproved =
      rowData.is_approved === true || rowData.is_approved === 1;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isApproved
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {isApproved ? "Approved" : "Pending"}
      </span>
    );
  };

  // User type template
  const userTypeTemplate = (userType: string) => {
    const typeColors = {
      student: "bg-blue-100 text-blue-800",
      teacher: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };

    // Handle null/undefined userType
    if (!userType) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          typeColors[userType as keyof typeof typeColors] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
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
      <KarkunJoinRequestForm
        onClose={handleCloseForm}
        initialData={selectedRequest}
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
              <h1 className="text-2xl font-bold text-gray-900">
                Karkun Join Requests
              </h1>
              <p className="text-gray-600 mt-1">
                Manage karkun join requests and their approval status
              </p>
            </div>
            {/* <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Create Request
            </button> */}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {(search.trim() || approvalFilter !== null) && (
                <div className="mt-2 text-sm text-gray-600">
                  {search.trim() && <span>Searching for: "{search}"</span>}
                  {search.trim() && approvalFilter !== null && <span> • </span>}
                  {approvalFilter !== null && (
                    <span>
                      Status: {approvalFilter ? "Approved" : "Pending"}
                    </span>
                  )}
                  <span> • Found {data?.data?.length || 0} results</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Approval Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="relative">
                  <select
                    value={
                      approvalFilter === null
                        ? "all"
                        : approvalFilter.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setApprovalFilter(
                        value === "all" ? null : value === "true"
                      );
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="false">Pending</option>
                    <option value="true">Approved</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {approvalFilter !== null && (
                  <button
                    onClick={() => setApprovalFilter(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                    title="Clear status filter"
                  >
                    Clear
                  </button>
                )}
              </div>

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
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PHONE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USER TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BIRTH YEAR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EHAD YEAR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ZONE ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LOCATION
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`hover:bg-gray-50 ${
                      index === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        {request.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={request.avatar}
                            alt={`${request.first_name} ${request.last_name}`}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {request.first_name} {request.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {request.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {request.phone_number || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userTypeTemplate(request.user_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {request.birth_year || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {request.ehad_year || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        {request.zone_id || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div>{request.city || "N/A"}</div>
                          <div className="text-gray-500 text-xs">
                            {request.country || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusTemplate(request)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {format(
                          new Date(request.created_at),
                          "dd MMM yyyy - hh:mm a"
                        )}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {format(
                          new Date(request.updated_at),
                          "dd MMM yyyy - hh:mm a"
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => confirmDelete(request)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                          disabled={isDeleting}
                          title="Delete request"
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
                  Delete Karkun Join Request
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this karkun join request?
                    This action cannot be undone.
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
                      setSelectedRequest(null);
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

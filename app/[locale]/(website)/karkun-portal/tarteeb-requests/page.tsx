"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";
import Link from "next/link";

interface Zone {
  id: number;
  title_en: string;
  city_en: string;
  country_en: string;
}

interface Mehfil {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en: string;
}

const TarteebRequestsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TarteebRequest[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);

  // Filters
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(
    user?.zone_id || null
  );
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Permissions
  const canFilterZones = user?.is_all_region_admin || user?.is_region_admin;

  useEffect(() => {
    loadRequests();
  }, [selectedZoneId, selectedMehfilId, statusFilter, search, page]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await TarteebRequestService.getAllTarteebRequests(
        page,
        pageSize,
        search,
        selectedZoneId || undefined,
        selectedMehfilId || undefined,
        statusFilter || undefined
      );
      setRequests(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading tarteeb requests:", error);
      toast.error("Failed to load tarteeb requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await TarteebRequestService.deleteTarteebRequest(deleteId);
      toast.success("Tarteeb request deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
      loadRequests();
    } catch (error: any) {
      console.error("Error deleting request:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete tarteeb request"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tarteeb Requests
              </h2>
              <p className="text-gray-600">
                Manage wazaif tarteeb requests from members
              </p>
            </div>
            <Link
              href="/karkun-portal/tarteeb-requests/new"
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors mt-4 md:mt-0"
            >
              + New Request
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setSelectedMehfilId(null);
                  setPage(1);
                }}
                disabled={!canFilterZones}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !canFilterZones ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Mehfil Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mehfil
              </label>
              <select
                value={selectedMehfilId || ""}
                onChange={(e) => {
                  setSelectedMehfilId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Mehfils</option>
                {mehfils.map((mehfil) => (
                  <option key={mehfil.id} value={mehfil.id}>
                    #{mehfil.mehfil_number} - {mehfil.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No tarteeb requests found</p>
            <Link
              href="/karkun-portal/tarteeb-requests/new"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Create First Request
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone / Mehfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Father: {request.father_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {request.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.zone?.title_en || "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.mehfilDirectory?.name_en || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            request.status || "pending"
                          )}`}
                        >
                          {request.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/karkun-portal/tarteeb-requests/${request.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                          <Link
                            href={`/karkun-portal/tarteeb-requests/edit/${request.id}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteId(request.id!);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this tarteeb request? This
                action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarteebRequestsPage;

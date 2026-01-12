"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useRouter } from "next/navigation";

interface Zone {
  id: number;
  title_en: string;
  city_en?: string;
  country_en?: string;
}

interface Mehfil {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en?: string;
}

type StatusValue = NonNullable<TarteebRequest["status"]>;

const statusOptions: { value: StatusValue; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const AdminTarteebRequestsPage = () => {
  const { user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TarteebRequest[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);
  const [mehfilCache, setMehfilCache] = useState<Record<number, Mehfil[]>>({});

  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(
    null
  );
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [linkExpiryHours, setLinkExpiryHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sortField, setSortField] = useState<"id" | "created_at" | "updated_at">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<TarteebRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canFilterZones = useMemo(
    () =>
      hasPermission(PERMISSIONS.VIEW_ZONES) ||
      !!(
        user?.is_super_admin ||
        user?.is_region_admin ||
        user?.is_all_region_admin
      ),
    [
      hasPermission,
      user?.is_all_region_admin,
      user?.is_region_admin,
      user?.is_super_admin,
    ]
  );

  const canFilterMehfils = useMemo(
    () =>
      canFilterZones ||
      hasPermission(PERMISSIONS.VIEW_MEHFIL_DIRECTORY) ||
      !!(user?.is_zone_admin || user?.is_mehfil_admin),
    [canFilterZones, hasPermission, user?.is_mehfil_admin, user?.is_zone_admin]
  );

  useEffect(() => {
    if (user?.zone_id && !selectedZoneId) {
      setSelectedZoneId(user.zone_id);
    }
    if (user?.mehfil_directory_id && !selectedMehfilId) {
      setSelectedMehfilId(user.mehfil_directory_id);
    }
  }, [
    selectedZoneId,
    selectedMehfilId,
    user?.zone_id,
    user?.mehfil_directory_id,
  ]);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zoneList = await TarteebRequestService.getZones(500);

        if (canFilterZones) {
          setZones(zoneList);
        } else if (user?.zone_id) {
          const filtered = zoneList.filter((zone) => zone.id === user.zone_id);
          if (filtered.length) {
            setZones(filtered);
          } else if (user?.zone) {
            const zone = user.zone as Partial<Zone>;
            setZones([
              {
                id: user.zone_id,
                title_en: zone?.title_en || "Your Zone",
                city_en: zone?.city_en,
                country_en: zone?.country_en,
              },
            ]);
          }
        } else {
          setZones(zoneList);
        }
      } catch (error) {
        console.error("Failed to load zones", error);
        toast.error("Failed to load zones");
      }
    };

    fetchZones();
  }, [canFilterZones, user?.zone, user?.zone_id]);

  useEffect(() => {
    const fetchMehfils = async () => {
      if (!selectedZoneId) {
        setMehfils([]);
        return;
      }

      try {
        const mehfilList = await TarteebRequestService.getMehfilsByZone(
          selectedZoneId,
          500
        );
        setMehfils(mehfilList);
        setMehfilCache((prev) => ({
          ...prev,
          [selectedZoneId]: mehfilList,
        }));
      } catch (error) {
        console.error("Failed to load mehfils", error);
        toast.error("Failed to load mehfils");
      }
    };

    fetchMehfils();
  }, [selectedZoneId]);

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

      const nextTotalPages = response.totalPages || 1;
      const nextTotalItems = response.totalItems || 0;
      setRequests(response.data);
      setTotalPages(nextTotalPages);
      setTotalItems(nextTotalItems);
      if (page > nextTotalPages) {
        setPage(nextTotalPages);
      }

      const uniqueZoneIds = Array.from(
        new Set(
          response.data
            .map((request) => request.zone_id)
            .filter((zoneId): zoneId is number => typeof zoneId === "number")
        )
      );

      const missingZoneIds = uniqueZoneIds.filter(
        (zoneId) => !mehfilCache[zoneId]
      );

      if (missingZoneIds.length) {
        const fetched = await Promise.all(
          missingZoneIds.map(async (zoneId) => {
            try {
              const list = await TarteebRequestService.getMehfilsByZone(
                zoneId,
                500
              );
              return { zoneId, list };
            } catch (error) {
              console.error(
                `Failed to load mehfils for zone ${zoneId}:`,
                error
              );
              return { zoneId, list: [] as Mehfil[] };
            }
          })
        );

        setMehfilCache((prev) => {
          const next = { ...prev };
          fetched.forEach(({ zoneId, list }) => {
            next[zoneId] = list;
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Error loading tarteeb requests:", error);
      toast.error("Failed to load tarteeb requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneId, selectedMehfilId, statusFilter, search, page, pageSize]);

  const resolveZoneName = (request: TarteebRequest) => {
    if (request.zone?.title_en) {
      return request.zone.title_en;
    }

    if (request.zone_id) {
      const zoneFromState = zones.find((zone) => zone.id === request.zone_id);
      if (zoneFromState) {
        return zoneFromState.title_en;
      }
    }

    return "—";
  };

  const resolveMehfilName = (request: TarteebRequest) => {
    if (request.mehfilDirectory?.name_en) {
      return request.mehfilDirectory.name_en;
    }

    if (request.zone_id && request.mehfil_directory_id) {
      const cached = mehfilCache[request.zone_id];
      const match = cached?.find(
        (mehfil) => mehfil.id === request.mehfil_directory_id
      );
      if (match) {
        return match.name_en;
      }
    }

    if (request.mehfil_directory_id) {
      const match = mehfils.find(
        (mehfil) => mehfil.id === request.mehfil_directory_id
      );
      if (match) {
        return match.name_en;
      }
    }

    return "—";
  };

  const handleStatusChange = async (
    requestId: number | undefined,
    newStatus: StatusValue
  ) => {
    if (!requestId) return;

    try {
      setStatusUpdateLoading(requestId);
      await TarteebRequestService.updateStatus(requestId, newStatus);
      toast.success("Status updated successfully");
      await loadRequests();
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(
        error?.response?.data?.message || "Failed to update request status"
      );
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleSortChange = (field: "id" | "created_at" | "updated_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusLabels: Record<string, string> = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const handleDeleteClick = (request: TarteebRequest) => {
    setRequestToDelete(request);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete?.id) return;

    try {
      setDeleting(true);
      await TarteebRequestService.deleteTarteebRequest(requestToDelete.id);
      toast.success("Tarteeb request deleted successfully");
      setShowDeleteDialog(false);
      setRequestToDelete(null);
      await loadRequests();
    } catch (error: any) {
      console.error("Failed to delete request", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete tarteeb request"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateLink = async () => {
    if (linkExpiryHours < 1 || linkExpiryHours > 720) {
      toast.error("Link expiry hours must be between 1 and 720");
      return;
    }

    try {
      setGeneratingLink(true);
      const result = await TarteebRequestService.generatePublicLink(
        linkExpiryHours,
        user?.zone_id,
        user?.mehfil_directory_id 
      );
      console.log('sdsdsdsdsdds',window.location.origin);
      setGeneratedLink(`${window.location.origin}${result.url}`);
      toast.success("Public link generated successfully!");
    } catch (error: any) {
      console.error("Failed to generate link", error);
      toast.error(
        error?.response?.data?.message || "Failed to generate public link"
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_TARTEEB_REQUESTS}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <hr className="border-gray-300 mb-6" />

          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tarteeb Requests
                </h2>
                <p className="text-gray-600">
                  Manage tarteeb requests and their details
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => {
                    setShowGenerateLinkModal(true);
                    setLinkExpiryHours(24);
                    setGeneratedLink("");
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Generate Public Tarteeb Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  disabled={!canFilterMehfils}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    !canFilterMehfils ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">All Mehfils</option>
                  {mehfils.map((mehfil) => (
                    <option key={mehfil.id} value={mehfil.id}>
                      #{mehfil.mehfil_number} - {mehfil.name_en}
                    </option>
                  ))}
                </select>
              </div>

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
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No tarteeb requests found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting the filters or search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50"
                          onClick={() => handleSortChange("id")}
                        >
                          <div className="flex items-center gap-2">
                            <span>ID</span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          NAME
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          STATUS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          CONTACT
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50"
                          onClick={() => handleSortChange("created_at")}
                        >
                          <div className="flex items-center gap-2">
                            <span>SUBMITTED AT/BY</span>
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
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer bg-gray-50"
                          onClick={() => handleSortChange("updated_at")}
                        >
                          <div className="flex items-center gap-2">
                            <span>UPDATED AT/BY</span>
                            {sortField === "updated_at" && (
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
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/${locale}/tarteeb-requests/${request.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {request.full_name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {request.father_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status || "pending")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {request.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.phone_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(request.created_at)}
                          </div>
                          <div className="text-sm text-gray-500">
                            —
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(request.updated_at)}
                          </div>
                          <div className="text-sm text-gray-500">
                            —
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center">
                            <ActionsDropdown
                              onEdit={() => router.push(`/${locale}/tarteeb-requests/${request.id}/edit`)}
                              onView={() => router.push(`/${locale}/tarteeb-requests/${request.id}`)}
                              onDelete={!isSuperAdmin ? () => handleDeleteClick(request) : undefined}
                              showView={true}
                              showEdit={true}
                              showDelete={!isSuperAdmin}
                              align="right"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {requests.length > 0 ? (page - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * pageSize, totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span> results
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Generate Public Link Modal */}
          {showGenerateLinkModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Generate Public Tarteeb Request Link
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create a public link that allows anyone to submit a tarteeb request
                  </p>
                </div>

                {!generatedLink ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Expiry (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={linkExpiryHours}
                        onChange={(e) =>
                          setLinkExpiryHours(parseInt(e.target.value, 10) || 24)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter hours (1-720)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the number of hours the link should be valid (max 720 hours / 30 days)
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowGenerateLinkModal(false);
                          setGeneratedLink("");
                          setLinkExpiryHours(24);
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateLink}
                        disabled={generatingLink}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingLink ? "Generating..." : "Generate Link"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generated Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This link will expire in {linkExpiryHours} hours
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setShowGenerateLinkModal(false);
                          setGeneratedLink("");
                          setLinkExpiryHours(24);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Tarteeb Request"
          message="Are you sure you want to delete this tarteeb request? This action cannot be undone."
          onClose={() => {
            setShowDeleteDialog(false);
            setRequestToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleting}
        />
      </div>
    </PermissionWrapper>
  );
};

export default AdminTarteebRequestsPage;

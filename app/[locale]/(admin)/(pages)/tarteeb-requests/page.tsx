"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import TarteebRequestService, {
  TarteebRequest,
} from "@/services/TarteebRequests";

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
  const { hasPermission } = usePermissions();

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
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(
    null
  );

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
      setRequests(response.data);
      setTotalPages(nextTotalPages);
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
  }, [selectedZoneId, selectedMehfilId, statusFilter, search, page]);

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

  const handleDelete = async (requestId: number | undefined) => {
    if (!requestId) return;
    if (!confirm("Are you sure you want to delete this tarteeb request?")) {
      return;
    }

    try {
      await TarteebRequestService.deleteTarteebRequest(requestId);
      toast.success("Tarteeb request deleted successfully");
      await loadRequests();
    } catch (error: any) {
      console.error("Failed to delete request", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete tarteeb request"
      );
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
                  Review and manage tarteeb advancement submissions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            {resolveZoneName(request)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {resolveMehfilName(request)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={request.status || "pending"}
                            onChange={(e) =>
                              handleStatusChange(
                                request.id,
                                e.target.value as StatusValue
                              )
                            }
                            disabled={statusUpdateLoading === request.id}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-full bg-gray-50"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {request.created_at
                            ? new Date(request.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-3">
                            <Link
                              href={`/tarteeb-requests/${request.id}`}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/karkun-portal/tarteeb-requests/${request.id}`}
                              className="text-blue-600 hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Portal
                            </Link>
                            <button
                              onClick={() => handleDelete(request.id)}
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
        </div>
      </div>
    </PermissionWrapper>
  );
};

export default AdminTarteebRequestsPage;

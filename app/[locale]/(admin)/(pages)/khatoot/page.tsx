"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import { Khat, MehfilSummary, ZoneSummary } from "@/types/khat";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/hooks/useAuth";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "in-review": "In Review",
  closed: "Closed",
};

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-review": "bg-green-100 text-green-800",
  closed: "bg-gray-200 text-gray-800",
};

const typeLabels: Record<string, string> = {
  khat: "Khat",
  masail: "Masail",
};

const typeClasses: Record<string, string> = {
  khat: "bg-blue-100 text-blue-800",
  masail: "bg-emerald-100 text-emerald-800",
};

const sortFieldLabels = {
  id: "ID",
  full_name: "Name",
  status: "Status",
  type: "Type",
  created_at: "Created",
} as const;

const AdminKhatListPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [khats, setKhats] = useState<Khat[]>([]);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [mehfils, setMehfils] = useState<MehfilSummary[]>([]);
  const [mehfilCache, setMehfilCache] = useState<Record<number, MehfilSummary[]>>({});

  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<keyof typeof sortFieldLabels>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Generate public link state
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [linkExpiryHours, setLinkExpiryHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zoneList = await KhatService.getZones(500);
        setZones(zoneList);
      } catch (error) {
        console.error("Failed to load zones", error);
        toast.error("Unable to load zones");
      }
    };

    fetchZones();
  }, []);

  useEffect(() => {
    const fetchMehfils = async () => {
      if (!selectedZoneId) {
        setMehfils([]);
        return;
      }

      try {
        const list = await KhatService.getMehfilsByZone(selectedZoneId, 500);
        setMehfils(list);
        setMehfilCache((prev) => ({ ...prev, [selectedZoneId]: list }));
      } catch (error) {
        console.error("Failed to load mehfils", error);
        toast.error("Unable to load mehfils");
      }
    };

    fetchMehfils();
  }, [selectedZoneId]);

  useEffect(() => {
    loadKhats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, selectedZoneId, selectedMehfilId, statusFilter, typeFilter, sortField, sortDirection]);

  const loadKhats = async () => {
    try {
      setLoading(true);
      const response = await KhatService.getKhats({
        page,
        size: pageSize,
        search,
        zoneId: selectedZoneId || undefined,
        mehfilDirectoryId: selectedMehfilId || undefined,
        status: statusFilter as any,
        type: typeFilter as any,
        sortField,
        sortDirection,
      });

      setKhats(response.data);
      setTotalPages(response.totalPages || 1);
      if (page > response.totalPages && response.totalPages > 0) {
        setPage(response.totalPages);
      }

      const zoneIds = Array.from(
        new Set(
          response.data
            .map((item) => item.zone_id)
            .filter((id): id is number => typeof id === "number")
        )
      );

      const missingZoneIds = zoneIds.filter((id) => !mehfilCache[id]);
      if (missingZoneIds.length) {
        const fetched = await Promise.all(
          missingZoneIds.map(async (zoneId) => {
            try {
              const list = await KhatService.getMehfilsByZone(zoneId, 500);
              return { zoneId, list };
            } catch (error) {
              console.error(`Failed to load mehfils for zone ${zoneId}`, error);
              return { zoneId, list: [] as MehfilSummary[] };
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
      console.error("Failed to load khatoot", error);
      toast.error("Unable to load khat records");
    } finally {
      setLoading(false);
    }
  };

  const resolveZoneName = (khat: Khat) => {
    if (khat.zone?.title_en) {
      return khat.zone.title_en;
    }

    if (khat.zone_id) {
      const cachedZone = zones.find((zone) => zone.id === khat.zone_id);
      if (cachedZone) {
        return cachedZone.title_en;
      }
    }

    return "—";
  };

  const resolveMehfilName = (khat: Khat) => {
    if (khat.mehfilDirectory?.name_en) {
      return `#${khat.mehfilDirectory.mehfil_number} - ${khat.mehfilDirectory.name_en}`;
    }

    if (khat.zone_id && khat.mehfil_directory_id) {
      const cached = mehfilCache[khat.zone_id];
      const match = cached?.find((mehfil) => mehfil.id === khat.mehfil_directory_id);
      if (match) {
        return `#${match.mehfil_number} - ${match.name_en}`;
      }
    }

    const fallback = mehfils.find((mehfil) => mehfil.id === khat.mehfil_directory_id);
    if (fallback) {
      return `#${fallback.mehfil_number} - ${fallback.name_en}`;
    }

    return "—";
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this khat record? This action cannot be undone.")) {
      return;
    }

    try {
      await KhatService.deleteKhat(id);
      toast.success("Khat record deleted");
      loadKhats();
    } catch (error: any) {
      console.error("Failed to delete khat", error);
      toast.error(error?.response?.data?.message || "Unable to delete record");
    }
  };

  const handleSortChange = (field: keyof typeof sortFieldLabels) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "full_name" ? "asc" : "desc");
    }
  };

  const openGenerateLinkModal = () => {
    setShowGenerateLinkModal(true);
    setLinkExpiryHours(24);
    setGeneratedLink("");
  };

  const handleGenerateLink = async () => {
    if (linkExpiryHours < 1 || linkExpiryHours > 720) {
      toast.error("Link expiry hours must be between 1 and 720");
      return;
    }

    try {
      setGeneratingLink(true);
      const result = await KhatService.generatePublicLink(
        linkExpiryHours,
        user?.zone_id,
        user?.mehfil_directory_id
      );
            setGeneratedLink(`${window.location.origin}${result.url}`);

     // setGeneratedLink(result.url);
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

  const sortedColumns = useMemo(
    () => ({
      active: sortField,
      direction: sortDirection,
    }),
    [sortField, sortDirection]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Khatoot / Masail</h1>
            <p className="text-gray-600">Monitor and review khat submissions from all zones.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            {!isSuperAdmin && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sorted by:</span>
                <span className="font-semibold text-gray-800">
                  {sortFieldLabels[sortedColumns.active]} ({sortedColumns.direction.toUpperCase()})
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={openGenerateLinkModal}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Generate Public Khat Link
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value ? Number(e.target.value) : null);
                  setSelectedMehfilId(null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mehfil</label>
              <select
                value={selectedMehfilId || ""}
                onChange={(e) => {
                  setSelectedMehfilId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                disabled={!selectedZoneId}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="khat">Khat</option>
                <option value="masail">Masail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(["id", "full_name", "status", "type", "created_at"] as Array<keyof typeof sortFieldLabels>).map(
                    (field) => (
                      <th
                        key={field}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange(field)}
                      >
                        <div className="flex items-center gap-2">
                          <span>{sortFieldLabels[field]}</span>
                          {sortField === field && (
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
                    )
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mehfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                      Loading khat records...
                    </td>
                  </tr>
                ) : khats.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                      No khat submissions found
                    </td>
                  </tr>
                ) : (
                  khats.map((khat) => (
                    <tr key={khat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{khat.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link
                          href={`/admin/khatoot/${khat.id}`}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          {khat.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusClasses[khat.status || "pending"] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabels[khat.status || "pending"] || khat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            typeClasses[khat.type || "khat"] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {typeLabels[khat.type || "khat"] || khat.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {khat.created_at ? new Date(khat.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{resolveZoneName(khat)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{resolveMehfilName(khat)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{khat.phone_number}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/khatoot/${khat.id}`}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            View
                          </Link>
                          {!isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(khat.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
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
        </div>

        {!loading && khats.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className={`px-4 py-2 rounded-lg border ${
                  page === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600"
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className={`px-4 py-2 rounded-lg border ${
                  page === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Generate Public Link Modal */}
        {showGenerateLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Generate Public Khat Link
                </h3>
                <p className="text-sm text-gray-600">
                  Create a public link that allows anyone to submit a khat
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
    </div>
  );
};

export default AdminKhatListPage;



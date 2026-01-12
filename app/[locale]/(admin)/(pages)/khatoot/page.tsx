"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import { Khat, MehfilSummary, ZoneSummary } from "@/types/khat";
import { usePermissions } from "@/context/PermissionContext";
import { useAuth } from "@/hooks/useAuth";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useRouter, useParams } from "next/navigation";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "in-review": "In Review",
  "awaiting-response": "Awaiting Response",
  closed: "Closed",
};

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-review": "bg-green-100 text-green-800",
  "awaiting-response": "bg-blue-100 text-blue-800",
  closed: "bg-gray-200 text-gray-800",
};

const typeLabels: Record<string, string> = {
  khat: "Khat",
  masail: "Masail",
};

const typeClasses: Record<string, string> = {
  khat: "bg-yellow-100 text-yellow-800",
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
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<keyof typeof sortFieldLabels>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Generate public link state
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [linkExpiryHours, setLinkExpiryHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [khatToDelete, setKhatToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setTotalItems(response.totalItems || response.data.length || 0);
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

  const handleDeleteClick = (id: number) => {
    setKhatToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!khatToDelete) return;

    try {
      setDeleting(true);
      await KhatService.deleteKhat(khatToDelete);
      toast.success("Khat record deleted successfully");
      setShowDeleteDialog(false);
      setKhatToDelete(null);
      loadKhats();
    } catch (error: any) {
      console.error("Failed to delete khat", error);
      toast.error(error?.response?.data?.message || "Unable to delete record");
    } finally {
      setDeleting(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Khatoot/Masail</h1>
            <p className="text-gray-600">Manage khatoot/masail and their details.</p>
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
                className="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name, email or phone...
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value ? Number(e.target.value) : null);
                  setSelectedMehfilId(null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="khat">Khat</option>
                <option value="masail">Masail</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="awaiting-response">Awaiting Response</option>
                <option value="closed">Closed</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("full_name")}
                  >
                    <div className="flex items-center gap-2">
                      <span>NAME</span>
                      {sortField === "full_name" && (
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    CONTACT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SUBMITTED AT/BY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    UPDATED AT/BY
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      Loading khat records...
                    </td>
                  </tr>
                ) : khats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No khat submissions found
                    </td>
                  </tr>
                ) : (
                  khats.map((khat) => {
                    const formatDateTime = (dateString?: string) => {
                      if (!dateString) return "—";
                      const date = new Date(dateString);
                      const day = date.getDate().toString().padStart(2, "0");
                      const month = date.toLocaleDateString("en-GB", { month: "short" });
                      const year = date.getFullYear();
                      const time = date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return `${day} ${month} ${year} - ${time}`;
                    };

                    return (
                      <tr key={khat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{khat.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/admin/khatoot/${khat.id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            {khat.full_name}
                          </Link>
                          {khat.father_name && (
                            <div className="text-xs text-gray-500 mt-1">{khat.father_name}</div>
                          )}
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
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {khat.email && <div>{khat.email}</div>}
                          {khat.phone_number && (
                            <div className="text-gray-600">{khat.phone_number}</div>
                          )}
                          {!khat.email && !khat.phone_number && "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDateTime(khat.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDateTime(khat.updated_at)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end">
                            <ActionsDropdown
                              onView={() => router.push(`/khatoot/${khat.id}`)}
                              onDelete={!isSuperAdmin ? () => handleDeleteClick(khat.id!) : undefined}
                              showView={true}
                              showEdit={false}
                              showDelete={!isSuperAdmin}
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
        </div>

        {!loading && khats.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {khats.length > 0 ? (page - 1) * pageSize + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className={`px-3 py-2 text-sm border-r border-gray-300 ${
                  page === 1
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
              >
                &lt;
              </button>
              {(() => {
                const getPageNumbers = () => {
                  const pages: (number | string)[] = [];
                  const delta = 1; // Show 1 page on each side of current
                  
                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);
                    
                    let start = Math.max(2, page - delta);
                    let end = Math.min(totalPages - 1, page + delta);
                    
                    // Adjust if we're near the start
                    if (page <= 3) {
                      end = Math.min(5, totalPages - 1);
                    }
                    
                    // Adjust if we're near the end
                    if (page >= totalPages - 2) {
                      start = Math.max(2, totalPages - 4);
                    }
                    
                    // Add ellipsis after first page if needed
                    if (start > 2) {
                      pages.push("ellipsis-start");
                    }
                    
                    // Add page numbers around current
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    
                    // Add ellipsis before last page if needed
                    if (end < totalPages - 1) {
                      pages.push("ellipsis-end");
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages;
                };
                
                const pageNumbers = getPageNumbers();
                
                return pageNumbers.map((pageNum, index) => {
                  if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-2 text-sm text-gray-500 border-r border-gray-300"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum as number)}
                      className={`px-3 py-2 text-sm border-r border-gray-300 ${
                        index === pageNumbers.length - 1 ? "last:border-r-0" : ""
                      } ${
                        page === pageNum
                          ? "bg-indigo-600 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className={`px-3 py-2 text-sm ${
                  page === totalPages
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
              >
                &gt;
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Khat"
          message="Are you sure you want to delete this khat record? This action cannot be undone."
          onClose={() => {
            setShowDeleteDialog(false);
            setKhatToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleting}
        />
      </div>
    </div>
  );
};

export default AdminKhatListPage;



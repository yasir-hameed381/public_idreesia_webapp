"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { X, Copy } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import KhatService from "@/services/KhatService";
import { Khat, MehfilSummary, ZoneSummary } from "@/types/khat";

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  "in-review": "bg-emerald-100 text-emerald-800",
  closed: "bg-gray-200 text-gray-700",
};

const typeBadgeClasses: Record<string, string> = {
  khat: "bg-sky-100 text-sky-800",
  masail: "bg-teal-100 text-teal-800",
};

const KarkunPortalKhatPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [khats, setKhats] = useState<Khat[]>([]);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [mehfils, setMehfils] = useState<MehfilSummary[]>([]);

  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(user?.zone_id || null);
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Public link generation state
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [linkExpiryHours, setLinkExpiryHours] = useState(24);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkZoneId, setLinkZoneId] = useState<number | null>(user?.zone_id || null);
  const [linkMehfilDirectoryId, setLinkMehfilDirectoryId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );
  const [linkMehfils, setLinkMehfils] = useState<MehfilSummary[]>([]);
  const [generatingLink, setGeneratingLink] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zoneList = await KhatService.getZones(300);
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
        const list = await KhatService.getMehfilsByZone(selectedZoneId, 300);
        setMehfils(list);
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
  }, [page, search, selectedZoneId, selectedMehfilId, statusFilter, typeFilter]);

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
        sortField: "created_at",
        sortDirection: "desc",
      });

      setKhats(response.data);
      setTotalPages(response.totalPages || 1);
      if (page > response.totalPages && response.totalPages > 0) {
        setPage(response.totalPages);
      }
    } catch (error) {
      console.error("Failed to load khatoot", error);
      toast.error("Unable to load khat submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGenerateLinkModal = () => {
    setLinkExpiryHours(24);
    setGeneratedLink("");
    setLinkZoneId(user?.zone_id || null);
    setLinkMehfilDirectoryId(user?.mehfil_directory_id || null);
    setShowGenerateLinkModal(true);
  };

  const handleGeneratePublicLink = async () => {
    if (!linkExpiryHours || linkExpiryHours < 1 || linkExpiryHours > 720) {
      toast.error("Link expiry hours must be between 1 and 720");
      return;
    }

    if (!linkZoneId) {
      toast.error("Please select a zone");
      return;
    }

    if (!linkMehfilDirectoryId) {
      toast.error("Please select a mehfil");
      return;
    }

    setGeneratingLink(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/khat/generate-public-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          linkExpiryHours,
          zone_id: linkZoneId,
          mehfil_directory_id: linkMehfilDirectoryId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const fullUrl = `${window.location.origin}${data.data.url}`;
        setGeneratedLink(fullUrl);
        toast.success("Public link generated successfully");
      } else {
        toast.error(data.message || "Failed to generate link");
      }
    } catch (error: any) {
      console.error("Error generating link:", error);
      toast.error("Failed to generate public link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Khatoot & Masail</h1>
              <p className="text-gray-600">
                Track submissions from your zone and mehfil.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadKhats}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={handleOpenGenerateLinkModal}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Generate Public Link
              </button>
              <Link
                href="/karkun-portal/khatoot/new"
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
              >
                + New Masail
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(e.target.value ? Number(e.target.value) : null);
                  setSelectedMehfilId(null);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                placeholder="Search by name, phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mehfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
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
                      Loading khat submissions...
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
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{khat.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link
                          href={`/karkun-portal/khatoot/${khat.id}`}
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          {khat.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {khat.zone?.title_en || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {khat.mehfilDirectory
                          ? `#${khat.mehfilDirectory.mehfil_number} - ${khat.mehfilDirectory.name_en}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{khat.phone_number}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusBadgeClasses[khat.status || "pending"]
                          }`}
                        >
                          {khat.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            typeBadgeClasses[khat.type || "khat"]
                          }`}
                        >
                          {khat.type || "khat"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {khat.created_at ? new Date(khat.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <Link
                          href={`/karkun-portal/khatoot/${khat.id}`}
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && khats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center justify-between">
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generate Public Link</h3>
                <button
                  onClick={() => {
                    setShowGenerateLinkModal(false);
                    setGeneratedLink("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {!generatedLink ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Expiry Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={linkExpiryHours}
                        onChange={(e) =>
                          setLinkExpiryHours(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="24"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Between 1 and 720 hours
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={linkZoneId || ""}
                        onChange={(e) => {
                          setLinkZoneId(
                            e.target.value ? Number(e.target.value) : null
                          );
                          setLinkMehfilDirectoryId(null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Zone</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.title_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mehfil <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={linkMehfilDirectoryId || ""}
                        onChange={(e) =>
                          setLinkMehfilDirectoryId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        disabled={!linkZoneId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Mehfil</option>
                        {linkMehfils.map((mehfil) => (
                          <option key={mehfil.id} value={mehfil.id}>
                            #{mehfil.mehfil_number} - {mehfil.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleGeneratePublicLink}
                      disabled={generatingLink}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingLink ? "Generating..." : "Generate Link"}
                    </button>
                    <button
                      onClick={() => {
                        setShowGenerateLinkModal(false);
                        setGeneratedLink("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      This link will expire in {linkExpiryHours} hours. Share
                      this link with members to allow them to submit khat/masail
                      requests.
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        setShowGenerateLinkModal(false);
                        setGeneratedLink("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KarkunPortalKhatPage;



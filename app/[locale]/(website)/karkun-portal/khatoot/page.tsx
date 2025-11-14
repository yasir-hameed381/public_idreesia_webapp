"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
      </div>
    </div>
  );
};

export default KarkunPortalKhatPage;



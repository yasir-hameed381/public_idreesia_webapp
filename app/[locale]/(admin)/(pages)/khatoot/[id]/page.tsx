"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import { JawabLink, Khat, KhatStatus } from "@/types/khat";
import KhatDetailView from "@/components/Khat/KhatDetailView";

const statusOptions: { value: KhatStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-review", label: "In Review" },
  { value: "closed", label: "Closed" },
];

const AdminKhatDetailPage = () => {
  const params = useParams<{ id: string }>();
  const khatId = Number(params?.id);

  const [khat, setKhat] = useState<Khat | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<KhatStatus>("pending");
  const [jawab, setJawab] = useState("");
  const [notes, setNotes] = useState("");
  const [jawabLinks, setJawabLinks] = useState<JawabLink[]>([]);

  useEffect(() => {
    if (!Number.isFinite(khatId)) {
      toast.error("Invalid khat reference");
      setLoading(false);
      return;
    }
    loadKhat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khatId]);

  const loadKhat = async () => {
    if (!Number.isFinite(khatId)) return;
    try {
      setLoading(true);
      const data = await KhatService.getKhatById(khatId);
      setKhat(data);
      setStatus((data.status as KhatStatus) || "pending");
      setJawab(data.jawab || "");
      setNotes(data.notes || "");
      setJawabLinks((data.jawab_links as JawabLink[]) || []);
    } catch (error) {
      console.error("Failed to load khat", error);
      toast.error("Unable to load khat details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setJawabLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setJawabLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateLink = (index: number, field: keyof JawabLink, value: string) => {
    setJawabLinks((prev) =>
      prev.map((link, idx) => (idx === index ? { ...link, [field]: value } : link))
    );
  };

  const filteredLinks = useMemo(
    () => jawabLinks.filter((link) => link.title && link.url),
    [jawabLinks]
  );

  const handleSave = async () => {
    if (!Number.isFinite(khatId)) return;

    try {
      setSaving(true);
      await KhatService.updateKhat(khatId, {
        status,
        jawab,
        jawab_links: filteredLinks,
        notes,
      });
      toast.success("Khat record updated");
      loadKhat();
    } catch (error: any) {
      console.error("Failed to save khat", error);
      toast.error(error?.response?.data?.message || "Unable to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!Number.isFinite(khatId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Invalid khat reference.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin/khatoot" className="text-sm text-green-600 hover:text-green-700">
              ← Back to Khat List
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Khat Details</h1>
            <p className="text-gray-600">
              Review submission details and update jawab or status.
            </p>
          </div>
          {khat?.created_at && (
            <div className="text-right text-sm text-gray-500">
              <p>Submitted</p>
              <p className="font-semibold text-gray-800">
                {new Date(khat.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading khat details...</p>
          </div>
        ) : !khat ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600">Khat submission not found.</p>
          </div>
        ) : (
          <KhatDetailView
            khat={khat}
            actionsSlot={
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as KhatStatus)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Private notes (optional)"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jawab / Guidance
                  </label>
                  <textarea
                    value={jawab}
                    onChange={(e) => setJawab(e.target.value)}
                    placeholder="Write jawab or guidance for this submission..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Jawab Links</h3>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="text-sm text-green-600 hover:text-green-700 font-semibold"
                    >
                      + Add Link
                    </button>
                  </div>

                  {jawabLinks.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No jawab links added yet. Click "Add Link" to include helpful resources.
                    </p>
                  )}

                  <div className="space-y-3">
                    {jawabLinks.map((link, index) => (
                      <div
                        key={`${index}-${link.title}-${link.url}`}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => handleUpdateLink(index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="Resource title"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              URL
                            </label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                              placeholder="https://example.com"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="mt-5 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={loadKhat}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-green-300"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default AdminKhatDetailPage;



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import KhatService from "@/services/KhatService";
import { Khat } from "@/types/khat";
import KhatDetailView from "@/components/Khat/KhatDetailView";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  "in-review": "bg-emerald-100 text-emerald-800",
  closed: "bg-gray-200 text-gray-700",
};

const typeColors: Record<string, string> = {
  khat: "bg-sky-100 text-sky-800",
  masail: "bg-teal-100 text-teal-800",
};

const KarkunPortalKhatDetailPage = () => {
  const params = useParams<{ id: string }>();
  const khatId = Number(params?.id);

  const [khat, setKhat] = useState<Khat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(khatId)) {
      toast.error("Invalid khat reference");
      setLoading(false);
      return;
    }

    const fetchKhat = async () => {
      try {
        setLoading(true);
        const data = await KhatService.getKhatById(khatId);
        setKhat(data);
      } catch (error) {
        console.error("Failed to load khat", error);
        toast.error("Unable to load khat submission");
      } finally {
        setLoading(false);
      }
    };

    fetchKhat();
  }, [khatId]);

  if (!Number.isFinite(khatId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Invalid khat reference.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/karkun-portal/khatoot" className="text-sm text-green-600 hover:text-green-700">
              ← Back to Khat List
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Khat Submission</h1>
            <p className="text-gray-600">Review the details of this submission.</p>
          </div>
          {khat && (
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  statusColors[khat.status || "pending"]
                }`}
              >
                {khat.status || "pending"}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  typeColors[khat.type || "khat"]
                }`}
              >
                {khat.type || "khat"}
              </span>
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
          <KhatDetailView khat={khat} />
        )}
      </div>
    </div>
  );
};

export default KarkunPortalKhatDetailPage;



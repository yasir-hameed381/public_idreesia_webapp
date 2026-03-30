"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CommitteePortalDocumentsPage() {
  const t = useTranslations("committeePortal");
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(10);
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t("documentsPage.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("documentsPage.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/documents/form`)}
          className="shrink-0 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          {t("documentsPage.uploadDocument")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("documentsPage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
          {t("documentsPage.noDocuments")}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AttachmentUploadField from "@/components/AttachmentUploadField";
import { useTranslations } from "next-intl";

export default function CommitteePortalDocumentFormPage() {
  const t = useTranslations("committeePortal");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t("documentsForm.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("documentsForm.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/documents`)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          {t("documentsForm.backToDocuments")}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("documentsForm.fieldTitle")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("documentsForm.fieldDescription")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("documentsForm.fieldUpload")}</label>
          <AttachmentUploadField />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            {t("documentsForm.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Paperclip } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFetchCommitteePortalContextQuery } from "@/store/slicers/committeesApi";
import { useTranslations } from "next-intl";

type Tab = "received" | "sent";

type MessageItem = {
  id: string;
  title: string;
  description: string;
  from?: string;
  to?: string;
  createdAtLabel: string;
  attachment?: boolean;
};

export default function CommitteePortalInboxPage() {
  const t = useTranslations("committeePortal");
  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [sentMessages, setSentMessages] = useState<MessageItem[]>([]);
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  const { data } = useFetchCommitteePortalContextQuery();
  const selectedMembership = data?.selected_committee;
  const isCommitteeAdmin = selectedMembership?.role === "admin";

  const tabs = useMemo(
    () => [
      { key: "received" as Tab, label: t("inboxPage.received") },
      { key: "sent" as Tab, label: t("inboxPage.sent") },
    ],
    [t]
  );

  const receivedMessages: MessageItem[] = [];
  const currentMessages = activeTab === "received" ? receivedMessages : sentMessages;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t("inboxPage.title")}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t("inboxPage.subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/${locale}/committee-portal/inbox/compose`)}
          className="shrink-0 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!isCommitteeAdmin}
          title={!isCommitteeAdmin ? t("inboxPage.composeRestricted") : t("inboxPage.composeMessageTooltip")}
        >
          {t("inboxPage.composeMessage")}
        </button>
      </div>

      <div className="flex items-center gap-0">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-4 py-2 text-sm font-medium border transition-colors",
                idx === 0 ? "rounded-l-md" : "rounded-r-md -ml-px",
                isActive
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {currentMessages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
              {t("inboxPage.noMessages")}
            </div>
          </div>
        ) : (
          currentMessages.map((item) => (
            <div
              key={item.id}
              className="block rounded-lg shadow-sm border border-gray-200 bg-white hover:bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="font-semibold text-gray-900 truncate">
                  {activeTab === "received" ? `From: ${item.from || t("inboxPage.fromUnknown")}` : `To: ${item.to || t("inboxPage.toCommittee")}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.createdAtLabel}</span>
                  {activeTab === "sent" ? <span className="font-bold">✓</span> : null}
                  {item.attachment ? <Paperclip size={14} /> : null}
                </div>
              </div>
              <div className="font-medium text-gray-700 truncate mb-1">{item.title}</div>
              <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


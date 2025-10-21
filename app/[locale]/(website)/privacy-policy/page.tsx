import React from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("PrivacyPolicy");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{t("title")}</h1>

      <div className="prose prose-lg max-w-none">
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("introduction.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("introduction.content")}
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("informationCollection.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("informationCollection.content")}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-gray-700 dark:text-gray-300">
              {t("informationCollection.items.personalInfo")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("informationCollection.items.contactInfo")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("informationCollection.items.usageData")}
            </li>
          </ul>
        </section>

        {/* How We Use Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("howWeUse.title")}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("howWeUse.content")}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-gray-700 dark:text-gray-300">
              {t("howWeUse.items.serviceProvision")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("howWeUse.items.communication")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("howWeUse.items.improvements")}
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("dataSecurity.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("dataSecurity.content")}
          </p>
        </section>

        {/* Data Sharing */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("dataSharing.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("dataSharing.content")}
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("yourRights.title")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("yourRights.content")}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li className="text-gray-700 dark:text-gray-300">
              {t("yourRights.items.access")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("yourRights.items.correction")}
            </li>
            <li className="text-gray-700 dark:text-gray-300">
              {t("yourRights.items.deletion")}
            </li>
          </ul>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("changes.title")}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("changes.content")}
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t("contact.content")}
          </p>
        </section>

        {/* Last Updated */}
        <div className="mt-12 text-sm text-gray-600 dark:text-gray-400 text-center">
          {t("lastUpdated")}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

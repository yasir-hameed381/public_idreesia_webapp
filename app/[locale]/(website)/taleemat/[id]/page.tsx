"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HardDriveDownload, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

const TaleematDetails = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taleematData = searchParams.get("data");
  const taleemat = taleematData ? JSON.parse(taleematData) : null;
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  if (!taleemat) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>{t("taleemat_not_found")}</p>
        </div>
      </div>
    );
  }

  const getTitle = () =>
    locale === "ur" ? taleemat.title_ur : taleemat.title_en;

  return (
    <>
      <Navigation />
      <div className="text-center mx-auto max-w-lg p-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
          <h1
            className={`text-2xl text-black font-bold mb-4 ${
              locale === "ur" ? "font-urdu text-right" : ""
            }`}
          >
            {getTitle()}
          </h1>
          <div className="border-b border-green-700 my-4"></div>
          {taleemat.filepath && (
            <div className="mb-4">
              <audio controls src={taleemat?.filepath} className="mt-2 w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {taleemat.description_en && (
            <p className="mb-4">
              <span className="font-bold text-gray-700">
                {t("description")}:
              </span>{" "}
              <span className="text-gray-600">{taleemat.description_en}</span>
            </p>
          )}
          {taleemat.filepath && (
            <div className="mb-4 flex flex-row items-center justify-center bg-[#048149] text-[#dadcdb]">
              <HardDriveDownload />
              <a
                href={taleemat?.filepath}
                download
                className="text-bold inline-block text-[#dadcdb] px-4 py-2 rounded transition-colors"
              >
                {t("Download Now")}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TaleematDetails;

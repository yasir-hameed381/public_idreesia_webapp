"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { HardDriveDownload, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import AudioPlayer from "@/components/AudioPlayer";

const MehfilDetails = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations();

  const mehfilDataString = localStorage.getItem("mehfilsData");

  const mehfil = mehfilDataString ? JSON.parse(mehfilDataString) : null;
  if (!mehfil) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Mehfil not found.</p>
        </div>
      </div>
    );
  }

  const getTitle = () => (locale === "ur" ? mehfil.title_ur : mehfil.title_en);

  return (
    <>
      <Navigation />
      <div className="bg-[#fcf8f5] min-h-screen py-12">
        <div className="text-center mx-auto max-w-2xl p-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <div className="flex justify-start mb-6 focus:ring-4 focus:ring-green-300">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-[#028f4f] hover:text-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
              <h1
                className={`mb-4 font-sans text-2xl ${
                  locale === "ur" ? "font-urdu text-right" : ""
                }`}
              >
                {getTitle()}
              </h1>
              <div className="border-b border-green-700 my-4"></div>
              {mehfil.filepath && (
                <div className="mb-4">
                  <AudioPlayer src={mehfil.filepath} className="mt-2 w-full" />
                </div>
              )}
              {mehfil.description_en && (
                <p className="mb-4">
                  <span className="font-bold text-gray-700">Description:</span>{" "}
                  <span className="text-gray-600">{mehfil.description_en}</span>
                </p>
              )}
              {mehfil.filepath && (
                <div className="pt-6 border-t border-zinc-200 mt-4">
                  <a
                    href={mehfil.filepath}
                    download
                    className="inline-flex items-center gap-2 text-white bg-[#028f4f] hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                  >
                    <HardDriveDownload className="w-4 h-4" />
                    <span>Download Now</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MehfilDetails;

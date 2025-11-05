"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { ArrowLeft, HardDriveDownload, Mic, Calendar, Tag } from "lucide-react";
import { useGetNaatSharifByIdQuery } from "@/store/slicers/naatsharifApi";
import AudioPlayer from "@/components/AudioPlayer";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import Navigation from "@/components/Navigation";

const NaatSharifDetails = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname.split("/")[1] || "en";
  const [naatId, setNaatId] = useState<number | null>(null);

  // Extract ID from params or localStorage fallback
  useEffect(() => {
    const idParam = params?.id as string;
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        setNaatId(id);
        return;
      }
    }

    // Fallback to localStorage if params not available
    const naatSharifData = localStorage.getItem("naatSharifData");
    if (naatSharifData) {
      try {
        const naat = JSON.parse(naatSharifData);
        if (naat.id) {
          setNaatId(parseInt(naat.id, 10));
        }
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
      }
    }
  }, [params]);

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetNaatSharifByIdQuery(naatId!, {
    skip: !naatId,
  });

  // Handle API response structure - it might be wrapped in data property
  const naatSharif =
    apiResponse && typeof apiResponse === "object" && "data" in apiResponse
      ? (apiResponse as any).data
      : apiResponse;

  // Fallback to localStorage if API fails or no data
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    if (!naatSharif && !isLoading && naatId) {
      // Try to get from localStorage as fallback
      const stored = localStorage.getItem("naatSharifData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only use if ID matches
          if (parsed.id === naatId || parsed.id === naatId.toString()) {
            setLocalStorageData(parsed);
          }
        } catch (e) {
          console.error("Error parsing localStorage:", e);
        }
      }
    }
  }, [naatSharif, isLoading, naatId]);

  // Use API data if available, otherwise fallback to localStorage
  const finalNaatData = naatSharif || localStorageData;

  const getTitle = () => {
    if (!finalNaatData) return "";
    return locale === "ur"
      ? finalNaatData.title_ur || finalNaatData.title || ""
      : finalNaatData.title_en || finalNaatData.title || "";
  };

  const getDescription = () => {
    if (!finalNaatData) return "";
    return locale === "ur"
      ? finalNaatData.description_ur || finalNaatData.description || ""
      : finalNaatData.description_en || finalNaatData.description || "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#fcf8f5] min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Show error only if we have no data at all (neither from API nor localStorage)
  if ((error || !finalNaatData) && !isLoading && !localStorageData) {
    return (
      <div className="bg-[#fcf8f5] min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-[#028f4f] hover:text-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <p>Naat Sharif not found.</p>
              {error && (
                <p className="text-sm mt-2">
                  Error:{" "}
                  {error && "status" in error
                    ? `${error.status}`
                    : "Unknown error"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!finalNaatData) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="bg-[#fcf8f5] min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-[#028f4f] hover:text-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-200">
              {/* Title */}
              <h1
                className={`text-2xl font-semibold mb-4 text-gray-900 ${
                  locale === "ur" ? "font-urdu text-right" : ""
                }`}
              >
                {getTitle()}
              </h1>

              {/* Metadata with Icons */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-500">
                {finalNaatData.track && (
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>{finalNaatData.track}</span>
                  </div>
                )}

                {finalNaatData.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span dir="ltr">
                      {formatDate(finalNaatData.created_at)}
                    </span>
                  </div>
                )}

                {finalNaatData.category && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{finalNaatData.category}</span>
                  </div>
                )}

                {finalNaatData.tags &&
                  Array.isArray(finalNaatData.tags) &&
                  finalNaatData.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>{finalNaatData.tags.join(", ")}</span>
                    </div>
                  )}
              </div>

              {/* Custom Audio Player */}
              {finalNaatData.filepath && (
                <div className="mb-8">
                  <AudioPlayer src={finalNaatData.filepath} />
                </div>
              )}

              {/* Description Box */}
              {getDescription() && (
                <div
                  className={`prose prose-sm mb-4 break-words text-gray-700 border border-red-200 rounded-lg p-4 bg-red-50 ${
                    locale === "ur" ? "font-urdu text-right" : ""
                  }`}
                >
                  <p className="whitespace-pre-line">{getDescription()}</p>
                </div>
              )}

              {/* Download Button */}
              {finalNaatData.filepath && (
                <div className="pt-6 border-t border-zinc-200 mt-4">
                  <a
                    href={finalNaatData.filepath}
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

export default NaatSharifDetails;

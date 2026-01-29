"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Share2, Download, Calendar, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetTaleematQuery } from "@/store/slicers/taleematApi";
import { useFetchMehfilsDataQuery } from "@/store/slicers/mehfilApi";
import { useFetchNaatSharifDataQuery } from "@/store/slicers/naatsharifApi";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import CategoryCards from "./CategoryCards";

interface ContentCardsProps {
  locale?: string;
}

const ContentCards: React.FC<ContentCardsProps> = ({ locale = "en" }) => {
  const t = useTranslations();
  const router = useRouter();
  
  // Refs for scrollable containers
  const taleemContainerRef = useRef<HTMLDivElement>(null);
  const mehfilContainerRef = useRef<HTMLDivElement>(null);
  const naatContainerRef = useRef<HTMLDivElement>(null);
  const wazaifContainerRef = useRef<HTMLDivElement>(null);

  // Fetch latest items
  const { data: taleematData, isLoading: loadingTaleemat } = useGetTaleematQuery({
    page: 1,
    size: 12,
    category: "all",
  });

  const { data: mehfilsData, isLoading: loadingMehfils } = useFetchMehfilsDataQuery({
    page: 1,
    size: 12,
    search: "",
  });

  const { data: naatsData, isLoading: loadingNaats } = useFetchNaatSharifDataQuery({
    page: 1,
    size: 12,
    search: "",
    category: "all",
  });

  const { data: wazaifData, isLoading: loadingWazaif } = useGetWazaifQuery({      
    page: 1,
    limit: 12,
    category: "bunyadi",
  });

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 300;
    const scrollDirection = direction === "left" ? -scrollAmount : scrollAmount;
    ref.current.scrollBy({ left: scrollDirection, behavior: "smooth" });
  };

  const handleShare = async (
    type: "taleem" | "mehfil" | "naat" | "wazaif",
    item: any
  ) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    let url = "";
    let shareText = "";

    if (type === "taleem") {
      url = `${baseUrl}/${locale === "ur" ? "ur/" : ""}taleem/${item.id || item.slug}`;
      const track = item.track || "";
      const date = item.track_date || item.created_at || "";
      const title = locale === "ur" ? item.title_ur : item.title_en;
      shareText = `السَلامُ عَلَيْكُم وَرَحْمَةُ اَللهِ وَبَرَكاتُهُ\n\n${
        locale === "ur"
          ? `ٹریک : ${track}\nٹاریخ: ${date}\nعنوان: ${title}\nآڈیو لنک: ${url}`
          : `Track: ${track}\nDate: ${date}\nTitle: ${title}\nAudio Link: ${url}`
      }`;
    } else if (type === "mehfil") {
      url = `${baseUrl}/${locale === "ur" ? "ur/" : ""}mehfil/${item.id}`;
      const date = item.date || "";
      const title = locale === "ur" ? item.title_ur : item.title_en;
      shareText = `السَلامُ عَلَيْكُم وَرَحْمَةُ اَللهِ وَبَرَكاتُهُ\n\n${
        locale === "ur"
          ? `ٹاریخ: ${date}\nعنوان: ${title}\nآڈیو لنک: ${url}`
          : `Date: ${date}\nTitle: ${title}\nAudio Link: ${url}`
      }`;
    } else if (type === "naat") {
      url = `${baseUrl}/${locale === "ur" ? "ur/" : ""}naatshareef/${item.id}`;
      const track = item.track || "";
      const date = item.track_date || item.created_at || "";
      const title = locale === "ur" ? item.title_ur : item.title_en;
      shareText = `السَلامُ عَلَيْكُم وَرَحْمَةُ اَللهِ وَبَرَكاتُهُ\n\n${
        locale === "ur"
          ? `${track ? `ٹریک : ${track}\n` : ""}${date ? `ٹاریخ: ${date}\n` : ""}عنوان: ${title}\nآڈیو لنک: ${url}`
          : `${track ? `Track: ${track}\n` : ""}${date ? `Date: ${date}\n` : ""}Title: ${title}\nAudio Link: ${url}`
      }`;
    } else if (type === "wazaif") {
      url = `${baseUrl}/${locale === "ur" ? "ur/" : ""}wazaif/${item.slug || item.id}`;
      const title = locale === "ur" ? item.title_ur : item.title_en;
      shareText = `السَلامُ عَلَيْكُم وَرَحْمَةُ اَللهِ وَبَرَكاتُهُ\n\n${
        locale === "ur" ? `عنوان: ${title}\nلنک: ${url}` : `Title: ${title}\nLink: ${url}`
      }`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // You can add a toast notification here
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const handleDownload = async (type: string, id: string | number, item?: any) => {
    try {
      // If item has filepath directly, try to download it directly
      if (item?.filepath) {
        const fileUrl = item.filepath;
        
        // If it's a full URL (S3 or external), download directly
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          // Create a temporary anchor element to trigger download
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = item.filename || `${type}-${id}.${fileUrl.split('.').pop()?.split('?')[0] || 'mp3'}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      }

      // Otherwise, use the download API endpoint
      // Laravel route structure: /download/{type}/{id}
      // Try Laravel public app URL first (for downloads), then fallback to API URL
      const laravelUrl = process.env.NEXT_PUBLIC_LARAVEL_URL || 
                        (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      
      // Use Laravel URL if available, otherwise use API URL
      const baseUrl = laravelUrl || apiUrl.replace('/api', '');
      
      // Laravel route structure: /download/{type}/{id}
      const downloadUrl = `${baseUrl}/download/${type}/${id}`;
      
      // Open download in new tab/window
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      // Fallback: try direct filepath if available
      if (item?.filepath) {
        window.open(item.filepath, "_blank");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ur" ? "ur-PK" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-12">
      {/* Taleemat Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#2D7A4A]">
                {locale === "ur" ? "تلیمات" : "Taleemat"}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={`/${locale === "ur" ? "ur/" : ""}taleemat`}
                className="inline-flex items-center text-[#2D7A4A] font-semibold hover:text-[#236339] uppercase text-sm tracking-wide"
              >
                {locale === "ur" ? "مزید دیکھیں" : "VIEW MORE"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollContainer(taleemContainerRef, "left")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollContainer(taleemContainerRef, "right")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={taleemContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
          >
            {loadingTaleemat ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              taleematData?.data?.slice(0, 12).map((taleem: any) => (
                <div
                  key={taleem.id}
                  className="min-w-[300px] md:min-w-[350px] bg-white rounded-xl shadow-sm border border-gray-100 snap-center flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {taleem.category && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {taleem.category.title_ur || taleem.category.title_en || "Category"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare("taleem", taleem)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload("taleem", taleem.id, taleem)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3
                      className={`text-lg font-bold text-gray-900 mb-2 line-clamp-2 ${
                        locale === "ur" ? "leading-[3rem] py-2" : ""
                      }`}
                    >
                      {locale === "ur" ? taleem.title_ur : taleem.title_en}
                    </h3>
                    <p
                      className={`text-sm text-gray-600 line-clamp-2 mb-4 ${
                        locale === "ur" ? "leading-loose" : ""
                      }`}
                    >
                      {locale === "ur" ? taleem.description : taleem.description_en || taleem.description}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                    {taleem.filepath && (
                      <audio controls className="w-full h-8">
                        <source src={taleem.filepath} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mehfils Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#2D7A4A]">
                {locale === "ur" ? "محافل" : "Mehfils"}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={`/${locale === "ur" ? "ur/" : ""}mehfils`}
                className="inline-flex items-center text-[#2D7A4A] font-semibold hover:text-[#236339] uppercase text-sm tracking-wide"
              >
                {locale === "ur" ? "مزید دیکھیں" : "VIEW MORE"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollContainer(mehfilContainerRef, "left")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollContainer(mehfilContainerRef, "right")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={mehfilContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
          >
            {loadingMehfils ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              mehfilsData?.data?.slice(0, 12).map((mehfil: any) => (
                <div
                  key={mehfil.id}
                  className="min-w-[300px] md:min-w-[350px] bg-white rounded-xl shadow-sm border border-gray-100 snap-center flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500"></div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare("mehfil", mehfil)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload("mehfil", mehfil.id, mehfil)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3
                      className={`text-lg font-bold text-gray-900 mb-2 line-clamp-2 ${
                        locale === "ur" ? "leading-[3rem] py-2" : ""
                      }`}
                    >
                      {locale === "ur" ? mehfil.title_ur : mehfil.title_en}
                    </h3>
                    <p
                      className={`text-sm text-gray-600 line-clamp-2 mb-4 ${
                        locale === "ur" ? "leading-loose" : ""
                      }`}
                    >
                      {locale === "ur" ? mehfil.description : mehfil.description_en || mehfil.description}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                    {mehfil.filepath && (
                      <audio controls className="w-full h-8">
                        <source src={mehfil.filepath} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Naat Shareef Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#2D7A4A]">
                {locale === "ur" ? "نعت شریف" : "Naat Shareef"}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={`/${locale === "ur" ? "ur/" : ""}naatsharif`}
                className="inline-flex items-center text-[#2D7A4A] font-semibold hover:text-[#236339] uppercase text-sm tracking-wide"
              >
                {locale === "ur" ? "مزید دیکھیں" : "VIEW MORE"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollContainer(naatContainerRef, "left")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollContainer(naatContainerRef, "right")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={naatContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
          >
            {loadingNaats ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              naatsData?.data?.slice(0, 12).map((naat: any) => (
                <div
                  key={naat.id}
                  className="min-w-[300px] md:min-w-[350px] bg-white rounded-xl shadow-sm border border-gray-100 snap-center flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(naat.track_date || naat.created_at || naat.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShare("naat", naat)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload("naat", naat.id, naat)}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3
                      className={`text-lg font-bold text-gray-900 mb-2 line-clamp-2 ${
                        locale === "ur" ? "leading-[3rem] py-2" : ""
                      }`}
                    >
                      {locale === "ur" ? naat.title_ur : naat.title_en || naat.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{naat.track || ""}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                    {naat.filepath && (
                      <audio controls className="w-full h-8">
                        <source src={naat.filepath} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Wazaif Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#2D7A4A]">
                {locale === "ur" ? "وظائف" : "Wazaif"}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={`/${locale === "ur" ? "ur/" : ""}wazaif`}
                className="inline-flex items-center text-[#2D7A4A] font-semibold hover:text-[#236339] uppercase text-sm tracking-wide"
              >
                {locale === "ur" ? "مزید دیکھیں" : "VIEW MORE"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollContainer(wazaifContainerRef, "left")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollContainer(wazaifContainerRef, "right")}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={wazaifContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide"
          >
            {loadingWazaif ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              wazaifData?.data?.slice(0, 12).map((wazaif: any) => {
                const handleWazaifClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  try {
                    // Store the complete wazaif data in localStorage (required by detail page)
                    localStorage.setItem("wazaifDetail", JSON.stringify(wazaif));
                    
                    // Navigate using slug if available, otherwise use id
                    const navigationId = wazaif.slug || wazaif.id;
                    const basePath = locale === "ur" ? "/ur" : "";
                    router.push(`${basePath}/wazaif/${navigationId}`);
                  } catch (error) {
                    console.error("Error storing wazaif data:", error);
                  }
                };

                return (
                  <div
                    key={wazaif.id}
                    onClick={handleWazaifClick}
                    className="w-[250px] md:w-[300px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 snap-center flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="p-5 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg text-[#2D7A4A]">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare("wazaif", wazaif);
                          }}
                          className="text-gray-400 hover:text-[#2D7A4A] transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h3
                        className={`text-lg font-bold text-gray-900 mb-2 line-clamp-2 ${
                          locale === "ur" ? "leading-[3rem] py-2" : ""
                        }`}
                      >
                        {locale === "ur" ? wazaif.title_ur : wazaif.title_en}
                      </h3>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <CategoryCards />
    </div>
  );
};

export default ContentCards;


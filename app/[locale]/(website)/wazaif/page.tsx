"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import { SearchIcon, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "@/app/constants/translationKeys";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import Navigation from "../../../../components/Navigation";

const WazaifList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const itemsPerPage = 20;

  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);

  const { data, isLoading, error } = useGetWazaifQuery({
    page: currentPage,
    size: itemsPerPage,
    search: searchQuery,
    category: activeCategory,
  });

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleWazaifClick = (item: any) => {
    localStorage.setItem("wazaifDetail", JSON.stringify(item));
    router.push(`/wazaif/${item.slug || item.id}`);
  };

  const getTitle = (item: any) => {
    return locale === "ur" ? item.title_ur : item.title_en;
  };

  const getDescription = (item: any) => {
    const desc = locale === "ur" 
      ? item.description || item.description_en || ""
      : item.description_en || item.description || "";
    if (!desc) return "";
    return desc.length > 100 ? desc.substring(0, 100) + "..." : desc;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { en: string; ur: string }> = {
      bunyadi: { en: "Bunyadi Wazaif", ur: "بنیادی وظائف" },
      notice_board_taleem: { en: "Notice Board Taleem", ur: "نوٹس بورڈ تعلیمات" },
      parhaiyan: { en: "Parhaiyan", ur: "پڑھائیں" },
      wazaif: { en: "Wazaif", ur: "وظائف" },
    };
    const label = categoryMap[category] || { en: category, ur: category };
    return locale === "ur" ? label.ur : label.en;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-700 py-12">
          <p>
            {locale === "ur"
              ? "ڈیٹا لوڈ کرنے میں خرابی"
              : "Error loading data"}
          </p>
        </div>
      );
    }

    const wazaifItems = data?.data || [];

    if (wazaifItems.length === 0 && searchQuery) {
      return (
        <div className="text-center text-red-700 py-12">
          <p>
            {locale === "ur"
              ? "کوئی نتیجہ نہیں ملا"
              : "No results found"}
          </p>
        </div>
      );
    }

    if (wazaifItems.length === 0) {
      return (
        <div className="text-center text-gray-500 py-12">
          <p>
            {locale === "ur" ? "کوئی وظائف نہیں ملے" : "No wazaifs found"}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {wazaifItems.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200 hover:bg-zinc-50 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleWazaifClick(item)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 self-center">
                  <FileText className="w-12 h-12 text-zinc-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div
                    className={`font-medium text-gray-900 ${
                      locale === "ur" ? "font-urdu text-right" : ""
                    }`}
                  >
                    {getTitle(item)}
                  </div>

                  {item.description && (
                    <div className="text-zinc-500 text-sm">
                      {getDescription(item)}
                    </div>
                  )}

                  {item.category && (
                    <div className="text-sm text-zinc-500">
                      {getCategoryLabel(item.category)}
                    </div>
                  )}

                  {(item.is_for_karkun || item.is_for_ehad_karkun) && (
                    <div className="flex gap-2 mt-2">
                      {item.is_for_karkun && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {locale === "ur" ? "کارکن کے لیے" : "For Karkun"}
                        </span>
                      )}
                      {item.is_for_ehad_karkun && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {locale === "ur"
                            ? "عہد کارکن کے لیے"
                            : "For Ehad Karkun"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.total > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              count={Math.ceil(data.meta.total / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#fcf8f5] min-h-screen py-12"
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Navigation />
          
          <h2 className="text-3xl text-center mb-8 text-gray-900">
            {t("wazaif")}
          </h2>

          {/* Search Input */}
          <div className="w-full mb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <SearchIcon className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="search"
                  id="wazaif-search"
                  className="block w-full p-4 ps-10 pe-20 text-sm text-zinc-900 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#028f4f]"
                  placeholder={
                    locale === "ur"
                      ? "تلاش کریں..."
                      : searchPlaceholder("title") || "Search..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  autoFocus
                />
                <div className="absolute inset-y-0 end-0 flex items-center pe-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#028f4f] text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    {locale === "ur" ? "تلاش" : "Search"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex justify-between flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("all")}
              type="button"
              className={`px-4 py-3 border border-zinc-200 text-sm font-medium rounded-lg focus:outline-none transition-colors ${
                activeCategory === "all"
                  ? "bg-[#028f4f] hover:bg-green-700 text-white"
                  : "bg-white hover:bg-gray-50 text-zinc-700"
              }`}
            >
              {locale === "ur" ? "تمام" : "All"} {t("wazaif")}
            </button>

            <button
              onClick={() => handleCategoryChange("bunyadi")}
              type="button"
              className={`px-4 py-3 border border-zinc-200 text-sm font-medium rounded-lg focus:outline-none transition-colors ${
                activeCategory === "bunyadi"
                  ? "bg-[#028f4f] hover:bg-green-700 text-white"
                  : "bg-white hover:bg-gray-50 text-zinc-700"
              }`}
            >
              {locale === "ur" ? "بنیادی" : "Bunyadi"} {t("wazaif")}
            </button>

            <button
              onClick={() => handleCategoryChange("notice_board_taleem")}
              type="button"
              className={`px-4 py-3 border border-zinc-200 text-sm font-medium rounded-lg focus:outline-none transition-colors ${
                activeCategory === "notice_board_taleem"
                  ? "bg-[#028f4f] hover:bg-green-700 text-white"
                  : "bg-white hover:bg-gray-50 text-zinc-700"
              }`}
            >
              {locale === "ur" ? "نوٹس بورڈ" : "Notice Board"}{" "}
              {locale === "ur" ? "تعلیمات" : "Taleemat"}
            </button>

            <button
              onClick={() => handleCategoryChange("parhaiyan")}
              type="button"
              className={`px-4 py-3 border border-zinc-200 text-sm font-medium rounded-lg focus:outline-none transition-colors ${
                activeCategory === "parhaiyan"
                  ? "bg-[#028f4f] hover:bg-green-700 text-white"
                  : "bg-white hover:bg-gray-50 text-zinc-700"
              }`}
            >
              {locale === "ur" ? "پڑھائیں" : "Parhaiyan"}
            </button>

            <button
              onClick={() => handleCategoryChange("wazaif")}
              type="button"
              className={`px-4 py-3 border border-zinc-200 text-sm font-medium rounded-lg focus:outline-none transition-colors ${
                activeCategory === "wazaif"
                  ? "bg-[#028f4f] hover:bg-green-700 text-white"
                  : "bg-white hover:bg-gray-50 text-zinc-700"
              }`}
            >
              {t("wazaif")}
            </button>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WazaifList;

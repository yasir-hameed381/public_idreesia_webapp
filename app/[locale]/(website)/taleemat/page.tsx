"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import playImage from "../../../assets/play.png";
import { SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useGetTaleematQuery } from "../../../../store/slicers//taleematApi";
import { TranslationKeys } from "../../../constants/translationKeys";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import Navigation from "../../../../components/Navigation";

interface TaleematItem {
  id: string | number;
  title_ur: string;
  title_en: string;
  created_at: string;
}

const CATEGORY_MAP = {
  AllTaleemat: "all",
  "Basic Taleemat": 1,
  "Quran Recitations": 3,
  "Dua Mubarak": 4,
  Azan: 6,
  "New/Daily Taleem": 7,
  "Short Taleemat": 8,
};

const Taleemat = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("AllTaleemat");
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);
  const nav = useTranslations(TranslationKeys.TALEEMAT_TITLES);
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const { data, isLoading, error } = useGetTaleematQuery({
    page: currentPage,
    size: itemsPerPage,
    search: searchQuery,
    category: CATEGORY_MAP[activeCategory],
  });

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderPaginationNumbers = () => {
    const totalPages = data?.meta.total
      ? Math.ceil(data.meta.total / itemsPerPage)
      : 5;
    const pages: (number | string)[] = [];
    const maxVisiblePages = 10;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 5) {
        for (let i = 2; i <= Math.min(maxVisiblePages, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pages.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getTitle = (item: TaleematItem) => {
    return locale === "ur" ? item.title_ur : item.title_en;
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {t("error_loading_data")}
          </div>
        </div>
      );
    }

    const taleematItems = data?.data || [];

    if (taleematItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {searchPlaceholder("no_results_found", { query: searchQuery })}
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("AllTaleemat");
              setCurrentPage(1);
            }}
            className="px-2 py-4 border border-gray-200 bg-white focus:text-white focus:bg-green-600 rounded-2xl text-gray-600 font-semibold hover:opacity-90 transition ring-2 ring-white"
          ></button>
        </div>
      );
    }

    const totalPages = data?.meta.total
      ? Math.ceil(data.meta.total / itemsPerPage)
      : 5;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, data?.meta?.total || 0);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl mx-auto">
          {taleematItems.map((item: any) => (
            <div
              key={item.id}
              className="w-full border border-[#e3e3e3] text-base rounded-[5px] bg-white mb-5 hover:bg-[#f6f6f6] hover:text-[#424242] transition"
            >
              <Link
                href={{
                  pathname: `/taleemat/${item.id}`,
                  query: { data: JSON.stringify(item) },
                }}
              >
                <div className="flex gap-[15px] py-[15px] px-[10px] items-center">
                  <Image
                    src={playImage}
                    alt="Header Image"
                    width={45}
                    height={45}
                  />
                  <div className="flex flex-col">
                    <h2
                      className={`text-base font-bold text-gray-700 ${
                        locale === "ur" ? "font-urdu text-right" : ""
                      }`}
                    >
                      {getTitle(item)}
                    </h2>
                    <p className="font-medium text-base text-[#53905b]">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Custom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-4 py-6">
          <div className="text-gray-600 text-base font-normal">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{data?.meta?.total || 0}</span> results
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {renderPaginationNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 py-2 text-gray-400 font-medium">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`min-w-[40px] h-[40px] px-3 py-2 rounded-md border font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#026419] text-white border-[#026419] shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div ref={containerRef} className="p-5 flex flex-col items-center">
      <Navigation />
      <h2 className="font-sans text-2xl text-gray-700 mb-10">
        {t("taleemat")}
      </h2>
      <div className="relative mb-8 w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon className="w-6 h-6 text-green-600" />
        </div>
        <input
          type="text"
          className="w-full px-[60px] py-[10px] rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder={searchPlaceholder("title")}
          value={searchQuery}
          onClick={handleSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>
      <div className="mb-5 flex space-x-4">
        {Object.keys(CATEGORY_MAP).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === category
                ? "bg-[#028f4f] text-white"
                : "bg-white text-[#424242] border border-[#e3e3e3]"
            } transition`}
          >
            {nav(category)}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
};

export default Taleemat;

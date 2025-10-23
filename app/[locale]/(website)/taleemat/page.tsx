// Taleemat.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Image from "next/image";
import playImage from "../../../assets/play.png";
import { SearchIcon } from "lucide-react";
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

    return (
      <>
        <div className="flex flex-col w-full border-[1px] border-[#e3e3e3] rounded-lg min-h-[200px] bg-white p-5">
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
                      className={`text-base font-medium text-gray-700 ${
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
        <Pagination
          count={
            data?.meta.total ? Math.ceil(data.meta.total / itemsPerPage) : 5
          }
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
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

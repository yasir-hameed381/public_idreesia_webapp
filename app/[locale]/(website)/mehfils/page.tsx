"use client";

import React, { useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import playImage from "../../../assets/Polygon 1.png";
import {
  mehfilApi,
  useFetchMehfilsDataQuery,
} from "../../../../store/slicers/mehfilApi";
import { TranslationKeys } from "../../../constants/translationKeys";
import Loadingspinner from "../../../../components/ui/Loadingspinner";
import MefilHeader from "../../../assets/gallery-images/image_9.png";
import Navigation from "../../../../components/Navigation";

interface MehfilItem {
  id: string | number;
  title_ur: string;
  title_en: string;
  created_at: string;
  date?: string;
  time?: string;
}

const Mehfils = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);

  // Modified API call to include date filter
  const { data, isLoading, isFetching } = useFetchMehfilsDataQuery({
    page: currentPage,
    size: itemsPerPage,
    search: searchQuery,
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
  });

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filter
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter({ startDate: "", endDate: "" });
    setCurrentPage(1);
  };

  console.log("mehfile data ================", data);

  const handleNavigation = (item: MehfilItem) => {
    // Note: Consider using sessionStorage or state management instead of localStorage
    // for better practices in a Next.js environment
    localStorage.setItem("mehfilsData", JSON.stringify(item));
    router.push(`/mehfils/${item.id}`);
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

  const getTitle = (item: any) => {
    return locale === "ur" ? item.title_ur : item.title_en;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === "ur" ? "ur-PK" : "en-US"
    );
  };

  const renderContent = () => {
    if (isLoading || isFetching) {
      return <Loadingspinner />;
    }

    if (!data?.data || data.data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {searchPlaceholder("no_results_found", { query: searchQuery })}
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {locale === "ur" ? "فلٹرز صاف کریں" : "Clear Filters"}
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl mx-auto">
          {data.data.map((item) => (
            <div
              key={item.id}
              className="border border-[#E3E3E3] text-base rounded-[20px] bg-[#FCF8F5] hover:bg-[#f6f6f6] hover:text-[#424242] transition"
            >
              <div
                onClick={() => handleNavigation(item)}
                className="flex gap-[15px] py-[15px] px-[10px] items-center justify-between cursor-pointer"
              >
                <div className="flex-1">
                  <h2
                    className={`text-base font-medium text-gray-700 ${
                      locale === "ur" ? "font-urdu text-right" : ""
                    }`}
                  >
                    {item.id}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(item.date)} {item.time && `• ${item.time}`}
                  </p>
                </div>
                <div className="w-[45px] h-[45px] bg-[#026419] rounded-full flex items-center justify-center">
                  <Image
                    src={playImage}
                    alt="Play"
                    width={15}
                    height={15}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="px-[10px] pb-2">
                <p className="font-medium text-base text-[#424242]">
                  {getTitle(item)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Pagination
            count={Math.ceil((data?.meta?.total || 0) / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </div>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="p-5 flex flex-col items-center bg-[#ffff]"
    >
      <Navigation />
      <Image
        src={MefilHeader}
        alt="mehfil header"
        style={{ maxWidth: "100%", height: "400px" }} // or any height you want
      />

      <div className="w-full max-w-5xl mt-10">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <SearchIcon className="w-7 h-7 text-white p-1 bg-[#026419] rounded-full" />
          </div>
          <input
            type="text"
            className="w-full px-5 py-[10px] rounded-3xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder={searchPlaceholder("title")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {/* Date Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === "ur" ? "شروع کی تاریخ" : "Start Date"}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === "ur" ? "اختتام کی تاریخ" : "End Date"}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-[#026419] text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {locale === "ur" ? "فلٹر" : "Filter"}
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              {locale === "ur" ? "صاف کریں" : "Clear"}
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Mehfils;

"use client";

import React, { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  // Debounced search query for API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [dateFilter, setDateFilter] = useState({
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const itemsPerPage = 15;
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);

  // Debounce search query - update debounced value after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params when debounced search/filters/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (dateFilter.startDate) params.set("startDate", dateFilter.startDate);
    if (dateFilter.endDate) params.set("endDate", dateFilter.endDate);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replace to avoid adding to history, but preserve state
    window.history.replaceState({}, "", newUrl);
  }, [debouncedSearchQuery, dateFilter, currentPage, pathname]);

  // Modified API call to include date filter
  const { data, isLoading, isFetching } = useFetchMehfilsDataQuery({
    page: currentPage,
    size: itemsPerPage,
    search: debouncedSearchQuery,
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
  });

  const handleSearch = () => {
    // Search is now handled by debounce, but we can keep this for Enter key
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filter
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter({ startDate: "", endDate: "" });
    setCurrentPage(1);
    // URL will be updated by useEffect
  };

  console.log("mehfile data ================", data);

  const handleNavigation = (item: MehfilItem) => {
    // Note: Consider using sessionStorage or state management instead of localStorage
    // for better practices in a Next.js environment
    localStorage.setItem("mehfilsData", JSON.stringify(item));
    // Navigate to detail page - search params are preserved in the list page URL
    // and will be restored when user navigates back
    router.push(`/mehfils/${item.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderPaginationNumbers = () => {
    const totalPages = Math.ceil((data?.meta?.total || 0) / itemsPerPage);
    const pages: (number | string)[] = [];
    const maxVisiblePages = 10;

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 5) {
        // Near the beginning
        for (let i = 2; i <= Math.min(maxVisiblePages, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
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
            {searchPlaceholder("no_results_found", { query: debouncedSearchQuery })}
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

    const totalPages = Math.ceil((data?.meta?.total || 0) / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(
      currentPage * itemsPerPage,
      data?.meta?.total || 0
    );

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
                  <div className="px-[10px] pb-2">
                    <h6 className="font-bold text-base text-[#424242]">
                      {getTitle(item)}
                    </h6>
                    <p className="font-xs line-clamp-3">
                      {item.description_en ?? "No Description Available"}
                    </p>
                  </div>
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
            </div>
          ))}
        </div>

        {/* Custom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-4 py-6">
          {/* Results Info */}
          <div className="text-gray-600 text-base font-normal">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{data?.meta?.total || 0}</span>{" "}
            results
          </div>

          {/* Pagination Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Page Numbers */}
            {renderPaginationNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 py-2 text-gray-400 font-medium">
                    ...
                  </span>
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

            {/* Next Button */}
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

        {/* Date Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg mx-auto items-center justify-center">
          <div className="flex-1 max-w-md">
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === "ur" ? "اختتام کی تاریخ" : "End Date"}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))
              }
            /> */}
            <div className="relative">
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
          </div>
          <div className="flex-1 max-w-md">
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === "ur" ? "شروع کی تاریخ" : "Start Date"}
            </label> */}
            <div className="relative">
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
          </div>

          <div className="flex items-center gap-2">
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

"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import playImage from "../../../assets/play.png";
import { SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TranslationKeys } from "@/app/constants/translationKeys";
import { useFetchNaatSharifDataQuery } from "@/store/slicers/naatsharifApi";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import Navigation from "../../../../components/Navigation";

interface NaatSharifItem {
  id: string | number;
  title_ur: string;
  title_en: string;
  created_at: string;
}

const CATEGORY_MAP = {
  all: "all",
  new: 2,
  old: 3,
};

const NaatSharif = () => {
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
  const categoryFromUrl = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(
    Object.keys(CATEGORY_MAP).includes(categoryFromUrl) 
      ? categoryFromUrl 
      : "all"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const itemsPerPage = 15;

  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);
  const naatsharif_titles = useTranslations(TranslationKeys.NAATSHARIF_TITLES);

  // Debounce search query - update debounced value after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params when debounced search/category/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (activeCategory && activeCategory !== "all") {
      params.set("category", activeCategory);
    }
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    // Use replace to avoid adding to history, but preserve state
    window.history.replaceState({}, "", newUrl);
  }, [debouncedSearchQuery, activeCategory, currentPage, pathname]);

  const { data, isLoading, error } = useFetchNaatSharifDataQuery({
    page: currentPage,
    size: itemsPerPage,
    search: debouncedSearchQuery,
    category: CATEGORY_MAP[activeCategory],
  });

  const handleNavigation = (item: NaatSharifItem) => {
    localStorage.setItem("naatSharifData", JSON.stringify(item));
    // Navigate to detail page - search params are preserved in the list page URL
    // and will be restored when user navigates back
    router.push(`/naatsharif/${item.id}`);
  };

  const handleSearch = () => {
    // Search is now handled by debounce, but we can keep this for Enter key
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    console.log("newCategory", newCategory);
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

  const getTitle = (item: NaatSharifItem) => {
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

    const naatSharifItems = data?.data || [];

    if (naatSharifItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {searchPlaceholder("no_results_found", { query: debouncedSearchQuery })}
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setCurrentPage(1);
              // URL will be updated by useEffect
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
          {naatSharifItems.map((item: any) => (
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
                    {getTitle(item)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="w-[45px] h-[45px] bg-[#026419] rounded-full flex items-center justify-center">
                  <Image
                    src={playImage}
                    alt="Play"
                    width={45}
                    height={45}
                    className="object-cover"
                  />
                </div>
              </div>
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
        {t("naatShareef")}
      </h2>
      <div className="relative mb-8 mx-auto w-full max-w-5xl">
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
        <button
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-2 rounded-lg ${
            activeCategory === "all"
              ? "bg-[#028f4f] text-white"
              : "bg-white text-[#424242] border border-[#e3e3e3]"
          } transition`}
        >
          {naatsharif_titles("nav.All Naat Shareef")}
        </button>
        <button
          onClick={() => handleCategoryChange("new")}
          className={`px-4 py-2 rounded-lg ${
            activeCategory === "new"
              ? "bg-[#028f4f] text-white"
              : "bg-white text-[#424242] border border-[#e3e3e3]"
          } transition`}
        >
          {naatsharif_titles("nav.New Naat Shareef")}
        </button>
        <button
          onClick={() => handleCategoryChange("old")}
          className={`px-4 py-2 rounded-lg ${
            activeCategory === "old"
              ? "bg-[#028f4f] text-white"
              : "bg-white text-[#424242] border border-[#e3e3e3]"
          } transition`}
        >
          {naatsharif_titles("nav.Old Naat Shareef")}
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default NaatSharif;

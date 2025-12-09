"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchIcon, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "@/app/constants/translationKeys";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import Navigation from "../../../../components/Navigation";

const WazaifList = () => {
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
  const validCategories = ["all", "bunyadi", "notice_board_taleem", "parhaiyan", "wazaif"];
  const categoryFromUrl = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(
    validCategories.includes(categoryFromUrl) ? categoryFromUrl : "all"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const itemsPerPage = 20;

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

  const { data, isLoading, error } = useGetWazaifQuery({
    page: currentPage,
    size: itemsPerPage,
    search: debouncedSearchQuery,
    category: activeCategory,
  });

  const handleSearch = () => {
    // Search is now handled by debounce, but we can keep this for form submission
    setDebouncedSearchQuery(searchQuery);
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
    const totalPages = Math.ceil((data?.meta?.total || 0) / itemsPerPage);
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

  const handleWazaifClick = (item: any) => {
    try {
      // Store the complete item data
      localStorage.setItem("wazaifDetail", JSON.stringify(item));

      // Navigate using slug if available, otherwise use id
      const navigationId = item.slug || item.id;
      console.log("Navigating to wazaif:", {
        id: item.id,
        slug: item.slug,
        navigationId,
      });

      // Navigate to detail page - search params are preserved in the list page URL
      // and will be restored when user navigates back
      router.push(`/wazaif/${navigationId}`);
    } catch (error) {
      console.error("Error storing wazaif data:", error);
    }
  };

  const getTitle = (item: any) => {
    return locale === "ur" ? item.title_ur : item.title_en;
  };

  const getDescription = (item: any) => {
    const desc =
      locale === "ur"
        ? item.description || item.description_en || ""
        : item.description_en || item.description || "";
    if (!desc) return "";
    return desc.length > 100 ? desc.substring(0, 100) + "..." : desc;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { en: string; ur: string }> = {
      bunyadi: { en: "Bunyadi Wazaif", ur: "بنیادی وظائف" },
      notice_board_taleem: {
        en: "Notice Board Taleem",
        ur: "نوٹس بورڈ تعلیمات",
      },
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
            {locale === "ur" ? "ڈیٹا لوڈ کرنے میں خرابی" : "Error loading data"}
          </p>
        </div>
      );
    }

    const wazaifItems = data?.data || [];

    if (wazaifItems.length === 0 && debouncedSearchQuery) {
      return (
        <div className="text-center text-red-700 py-12">
          <p>{locale === "ur" ? "کوئی نتیجہ نہیں ملا" : "No results found"}</p>
        </div>
      );
    }

    if (wazaifItems.length === 0) {
      return (
        <div className="text-center text-gray-500 py-12">
          <p>{locale === "ur" ? "کوئی وظائف نہیں ملے" : "No wazaifs found"}</p>
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
        <div className="space-y-4">
          {wazaifItems.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200 hover:bg-zinc-50 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleWazaifClick(item)}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 self-center">
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

        {/* Custom Pagination */}
        {data?.meta && data.meta.total > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-4 py-6">
            <div className="text-gray-600 text-base font-normal">
              Showing <span className="font-medium">{startItem}</span> to{" "}
              <span className="font-medium">{endItem}</span> of{" "}
              <span className="font-medium">{data?.meta?.total || 0}</span>{" "}
              results
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
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className="bg-[#fcf8f5] min-h-screen py-12">
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

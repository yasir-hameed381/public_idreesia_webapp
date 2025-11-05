"use client";
import { TranslationKeys } from "@/app/constants/translationKeys";
import LoadingSpinner from "@/components/ui/Loadingspinner";
import { useFetchZonesQuery } from "@/store/slicers/zoneApi";
import { useFetchAddressQuery } from "@/store/slicers/mehfildirectoryApi";
import { useLocale, useTranslations } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Navigation from "../../../../components/Navigation";

interface MehfilData {
  id: number;
  name_en: string;
  name_ur: string;
  address_en: string;
  address_ur: string;
  city_en: string;
  city_ur: string;
  google_location: string | null;
  co_phone_number: string;
  zimdar_bhai_phone_number: string | null;
  zimdar_bhai_phone_number_2: string | null;
  zimdar_bhai_phone_number_3: string | null;
  mehfil_open: string;
  mehfil_number: string;
  title_en?: string;
  [key: string]: any;
}

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

const MehfilDirectory: React.FC = () => {
  const t = useTranslations(TranslationKeys.MEHFIL_DIRECTORY);
  const locale = useLocale();

  // State management
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [zoneSearchTerm, setZoneSearchTerm] = useState<string>("");
  const [showZoneDropdown, setShowZoneDropdown] = useState<boolean>(false);
  const zoneDropdownRef = useRef<HTMLDivElement>(null);
  const perPage = 8;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch zones data
  const {
    data: zonesData,
    isLoading: isZonesLoading,
    error: zonesError,
  } = useFetchZonesQuery({
    page: 1,
    per_page: 100,
  });

  // Fetch address data with server-side pagination and filtering
  const {
    data: addressData,
    isLoading: isAddressLoading,
    error: addressError,
    refetch: refetchAddress,
  } = useFetchAddressQuery({
    page: currentPage,
    size: perPage,
    search: debouncedSearchTerm,
    zoneId: selectedZone === "all" ? "" : selectedZone,
  });

  const ALL_ZONES = zonesData?.data || [];
  const mehfilData = addressData?.data || [];
  const pagination: PaginationData = addressData?.meta
    ? {
        totalItems: addressData.meta.total,
        totalPages: addressData.meta.last_page,
        currentPage: addressData.meta.current_page,
        perPage: parseInt(addressData.meta.per_page),
      }
    : {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        perPage: perPage,
      };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        zoneDropdownRef.current &&
        !zoneDropdownRef.current.contains(event.target as Node)
      ) {
        setShowZoneDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter zones based on search term
  const filteredZones = ALL_ZONES.filter((zone) =>
    zone.title_en?.toLowerCase().includes(zoneSearchTerm.toLowerCase())
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchTerm.trim()) {
      refetchAddress();
    }
  };

  // Handle zone selection
  const handleZoneSelect = (zoneTitle: string) => {
    if (zoneTitle === "all") {
      setSelectedZone("all");
    } else {
      const zone = ALL_ZONES.find((z) => z.title_en === zoneTitle);
      setSelectedZone(zone?.id || "all"); // Store the ID instead of title
    }
    setCurrentPage(1);
    setShowZoneDropdown(false);
    setZoneSearchTerm("");
  };
  const toggleZoneDropdown = () => {
    setShowZoneDropdown(!showZoneDropdown);
    setZoneSearchTerm("");
  };

  const getLocalizedText = (urText?: string, enText?: string) =>
    locale === "ur" ? urText || enText : enText || urText;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination?.totalPages || 0;
    const pages: (number | string)[] = [];

    if (totalPages === 0) return pages;

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const openDirections = (url: string | null, address?: string) => {
    if (!url) {
      const mapsUrl = address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address
          )}`
        : `https://www.google.com/maps`;
      window.open(mapsUrl, "_blank");
    } else {
      window.open(url, "_blank");
    }
  };

  // Show loading spinner while data is loading
  if (isZonesLoading || isAddressLoading) {
    return <LoadingSpinner />;
  }

  // Show error message if there's an error
  if (zonesError || addressError) {
    return (
      <div className="text-center py-8 text-red-500">Error loading data</div>
    );
  }

  return (
    <div dir={locale === "ur" ? "rtl" : "ltr"}>
      <Navigation />
      <div className="bg-gray-50 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium text-center text-gray-800 mb-8">
            {t("heading")}
          </h1>

          <div
            className={`flex flex-col md:flex-row ${
              locale === "ur" ? "md:flex-row" : ""
            } gap-4 mb-8`}
          >
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-green-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {/* Zone Selector with Search */}
            <div className="w-full md:w-1/2 relative" ref={zoneDropdownRef}>
              <div
                className="w-full border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer flex justify-between items-center"
                onClick={toggleZoneDropdown}
              >
                <span>
                  {selectedZone === "all"
                    ? t("viewAllZones")
                    : getLocalizedText(
                        ALL_ZONES.find((z) => z.id === selectedZone)?.title_ur,
                        ALL_ZONES.find((z) => z.id === selectedZone)?.title_en
                      )}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showZoneDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {showZoneDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {/* Zone Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Search zones..."
                      value={zoneSearchTerm}
                      onChange={(e) => setZoneSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Zone List */}
                  <div className="max-h-60 overflow-y-auto">
                    <div
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        selectedZone === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleZoneSelect("all")}
                    >
                      {t("viewAllZones")}
                    </div>
                    {filteredZones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          selectedZone === zone.id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => handleZoneSelect(zone.title_en)}
                      >
                        {getLocalizedText(zone.title_ur, zone.title_en)}
                      </div>
                    ))}
                    {filteredZones.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">
                        No zones found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mehfil List */}
          <div className="space-y-4">
            {mehfilData.length > 0 ? (
              mehfilData.map((mehfil) => (
                <div
                  key={mehfil.id}
                  className="bg-white rounded-md shadow-sm border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Left Column - Name & Location */}
                    <div
                      className={`p-6 ${
                        locale === "ur"
                          ? "border-l p-6 flex flex-col justify-center items-center text-center"
                          : "border-r p-6 flex flex-col justify-center items-center text-center"
                      } border-gray-200`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t("mehfilNumber")} {mehfil.mehfil_number}
                      </h3>
                      {getLocalizedText(mehfil.name_ur, mehfil.name_en)}
                    </div>

                    {/* Middle Column - Address & Time */}
                    <div
                      className={`p-6 ${
                        locale === "ur" ? "border-l" : "border-r"
                      } border-gray-200`}
                    >
                      {getLocalizedText(mehfil.address_ur, mehfil.address_en)}
                      <p className="text-gray-700 font-medium text-sm mt-4 text-center">
                        {`${t("Time")}: ${mehfil.mehfil_open}`}
                      </p>
                    </div>

                    {/* Right Column - Phone & Directions */}
                    <div className="p-6 flex flex-col items-center">
                      <div className="mb-2">
                        <p className="text-gray-800">
                          {mehfil.co_phone_number}
                        </p>
                        {mehfil.zimdar_bhai_phone_number && (
                          <p className="text-gray-800">
                            {mehfil.zimdar_bhai_phone_number}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto">
                        <button
                          className="bg-blue-100 text-blue-600 px-4 py-1 rounded-md text-sm hover:bg-blue-200 transition"
                          onClick={() =>
                            openDirections(
                              mehfil.google_location,
                              mehfil.address_en
                            )
                          }
                        >
                          {t("getDirections")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("no_results_found")}
              </div>
            )}
          </div>

          {/* Custom Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 px-4 py-6">
              {/* Results Info */}
              <div className="text-gray-600 text-base font-normal">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * perPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * perPage, pagination.totalItems)}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
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
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-2 text-gray-400 font-medium"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => handlePageChange(Number(page))}
                      className={`min-w-[40px] h-[40px] px-3 py-2 rounded-md border font-medium transition-all ${
                        currentPage === page
                          ? "bg-[#026419] text-white border-[#026419] shadow-sm"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MehfilDirectory;

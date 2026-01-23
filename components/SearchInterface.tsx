"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "../app/constants/translationKeys";
import { useTheme } from "@/context/useTheme";

interface SearchResult {
  id: string | number;
  title_en?: string;
  title_ur?: string;
  track?: string;
  description_en?: string;
  filepath?: string;
  [key: string]: any;
}

const SearchInterface = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);
  
  const isDark = resolvedTheme === "dark";

  const navItems = [
    { key: "taleem", label: t("taleemat"), color: "#0b2d52" },
    { key: "mehfils", label: t("mehfils"), color: "#efc54f" },
    { key: "naat", label: t("naatShareef"), color: "#f29d65" },
  ];

  const fetchSearchResults = async (query, type) => {
    if (!query || !type) return;

    setIsLoading(true);
    setError(null);

    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_URL
    }/search?query=${query}&type=${type.toLowerCase()}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }
      const data = await response.json();

      setSearchResults(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery && selectedCategory) {
        fetchSearchResults(searchQuery, selectedCategory);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, selectedCategory]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate based on category
    if (selectedCategory === "taleem") {
      router.push(`/taleemat/${result.id}`);
    } else if (selectedCategory === "mehfils") {
      // Store mehfil data in localStorage for the details page
      localStorage.setItem("mehfilsData", JSON.stringify(result));
      router.push(`/mehfils/${result.id}`);
    } else if (selectedCategory === "naat") {
      router.push(`/naat-shareef/${result.id}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        className={`w-full px-4 py-6 transition-colors ${
          isDark ? "bg-[#090909]" : "bg-[#fcf8f5]"
        }`}
      >
        <div className="max-w-4xl mx-auto relative">
          {/* Search Icon */}
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            isDark ? "text-gray-400" : "text-gray-400"
          }`}>
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all ${
              isDark
                ? "bg-[#000] border-[#6bb179] text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500"
            } focus:outline-none`}
            placeholder={searchPlaceholder("title")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Buttons */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex flex-wrap gap-3 md:justify-between">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(item.key)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === item.key
                    ? "bg-green-600 text-white shadow-md"
                    : isDark
                    ? "bg-[#000] text-gray-200 hover:bg-gray-700 border border-[#6bb179]"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Section */}
        <div className="max-w-4xl mx-auto relative mt-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDark ? "border-green-400" : "border-green-500"
              }`}></div>
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-lg border ${
              isDark
                ? "bg-red-900/20 text-red-400 border-red-800"
                : "bg-red-50 text-red-600 border-red-200"
            }`}>
              {error}
            </div>
          )}

          {searchResults.length > 0 && searchQuery && (
            <div className={`border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 ${
              isDark
                ? "bg-[#000] border-[#6bb179]"
                : "bg-white border-gray-300"
            }`}>
              {searchResults.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`px-6 py-4 cursor-pointer border-b last:border-b-0 transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 border-[#6bb179]"
                      : "hover:bg-gray-50 border-gray-100"
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <h3 className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {result.title_en || "Untitled"}
                  </h3>
                  {result.title_ur && (
                    <p className={`text-sm mt-1 font-urdu text-right ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {result.title_ur}
                    </p>
                  )}
                  {result.track && (
                    <p className={`text-sm mt-2 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Track: {result.track}
                    </p>
                  )}
                  {result.description_en && (
                    <p className={`text-sm mt-1 line-clamp-2 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {result.description_en}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading &&
            !error &&
            selectedCategory &&
            searchResults.length === 0 &&
            searchQuery && (
              <div className={`text-center py-8 rounded-lg border ${
                isDark
                  ? "bg-[#000] border-[#6bb179]"
                  : "bg-white border-gray-200"
              }`}>
                <p className={isDark ? "text-gray-300" : "text-gray-500"}>
                  {searchPlaceholder("no_results_found")}
                </p>
                <p className={`text-sm mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-400"
                }`}>
                  Try a different search term or category.
                </p>
              </div>
            )}

          {!selectedCategory && searchQuery && (
            <div className={`text-center py-6 rounded-lg border ${
              isDark
                ? "bg-[#000] border-[#6bb179]"
                : "bg-white border-gray-200"
            }`}>
              <p className={isDark ? "text-gray-300" : "text-gray-500"}>
                Please select a category to search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;

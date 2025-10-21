"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SearchIcon from "./Search-Icon";
import { useLocale, useTranslations } from "next-intl";

import { useDispatch, useSelector } from "react-redux";
import {
  clearSearchResults,
  setSearchDetails,
  fetchSearchResults,
} from "../store/slicers/searchSlice";
import { TranslationKeys } from "../app/constants/translationKeys";
import useDebounce from "../app/hooks/useDebounce";

const MainPageNavigationSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const locale = useLocale(); // Get the currently selected locale
  
  const t = useTranslations(TranslationKeys.MAIN_NAVIGATION_TITLE);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);

  const dispatch: any = useDispatch();
  const router = useRouter();
  const searchContainerRef = useRef(null);

  const { searchResults, isLoading, error } =
    useSelector((state: any) => state.search);

  const navItems = [{ key: "taleem" }, { key: "mehfils" }, { key: "naat" }];

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  useEffect(() => {
    if (debouncedSearchQuery && selectedCategory) {
      dispatch(
        fetchSearchResults({
          query: debouncedSearchQuery,
          type: selectedCategory,
        })
      );
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedSearchQuery, selectedCategory, dispatch]);

  const handleResultClick = (result) => {
    dispatch(
      setSearchDetails({
        id: result.id,
        title_ur: result.title_ur,
        title_en: result.title_en,
        track: result.track,
        filepath: result.filepath,
      })
    );

    router.push("/mainpagenavigationdetails");

    dispatch(clearSearchResults());
  };

  const handleCategoryClick = (category) => {

    setSelectedCategory(category);
  };

  return (
    <div className="min-h-[380px] bg-[#fcf8f5] mt-[60px]">
      <div ref={searchContainerRef} className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-green-600" />
          </div>
          <input
            type="text"
            className="w-full px-[60px] py-[10px] rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-600 text-black"
            placeholder={searchPlaceholder("title")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`px-[5px] py-[15px] border-[#e3e3e3] bg-white focus:text-white focus:bg-[#028f4f] border-[1px] rounded-2xl text-[#424242] font-semibold hover:opacity-90 transition ${
                selectedCategory === item.key ? "ring-2 ring-white !bg-[#028f4f] !text-white" : ""
              }`}
              onClick={() => handleCategoryClick(item.key)}
            >
              {t(`nav.${item.key}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        ) : searchResults.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <h3 className="text-lg font-semibold text-black">
                {result[`title_${locale}`] || result.title_en}
                </h3>
                {result.track && (
                  <p className="text-black-600 mt-1">{result.track}</p>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery && selectedCategory ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">
              {searchPlaceholder("no_results_found", {
                searchQuery,
                selectedCategory,
              })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MainPageNavigationSearch;

"use client"
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Pagination from '@mui/material/Pagination';
import Image from "next/image";
import playImage from "../../assets/play.png";
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useFetchNaatSharifDataQuery } from '../../../store/slicers/naatsharifApi';
import {useRouter} from 'next/navigation';
import { TranslationKeys } from '../../constants/translationKeys';

interface NaatSharifItem {
  id: string | number;
  title_ur: string;
  title_en: string;
  created_at: string;
}

const CATEGORY_MAP = {
  all: "all",
  new: 1,
  old: 2,
};

const NaatSharif = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);
  const naatsharif_titles = useTranslations(TranslationKeys.NAATSHARIF_TITLES);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en'; 

  const { data, isLoading, error } = useFetchNaatSharifDataQuery({
    page: currentPage,
    size: itemsPerPage,
    search: searchQuery,
    category: CATEGORY_MAP[activeCategory],
  });

  
  const handleNavigation = (item: NaatSharifItem) => {
    localStorage.setItem('naatSharifData', JSON.stringify(item));
    router.push(`/naatsharif/${item.id}`);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getTitle = (item: NaatSharifItem) => {
    return locale === 'ur' ? item.title_ur : item.title_en;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {t('error_loading_data')}
          </div>
        </div>
      );
    }

    const naatSharifItems = data?.data || [];

    if (naatSharifItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {t('no_results_found', { query: searchQuery })}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setCurrentPage(1);
            }}
            className="px-2 py-4 border border-gray-200 bg-white focus:text-white focus:bg-green-600 rounded-2xl text-gray-600 font-semibold hover:opacity-90 transition ring-2 ring-white"
          >
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col w-full border-[1px] border-[#e3e3e3] rounded-lg min-h-[200px] bg-white p-5">
          {naatSharifItems.map((item) => (
            <div
              key={item.id}
              className="w-full border border-[#e3e3e3] text-base rounded-[5px] bg-white mb-5 hover:bg-[#f6f6f6] hover:text-[#424242] transition"
            >
              {/* <Link
                href={{
                  pathname: `/naatsharif/${item.id}`,
                  query: { data: JSON.stringify(item) }, 
                }}
              > */}

              <a               onClick={() => handleNavigation(item)} 
              >
              </a>
                <div className="flex gap-[15px] py-[15px] px-[10px] items-center">
                  <Image
                    src={playImage}
                    alt="Header Image"
                    width={45}
                    height={45}
                  />
                  <div className="flex flex-col">
                    <h2 className={`text-base font-medium text-gray-700 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
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
             
            </div>
          ))}
        </div>
        <Pagination
          count={data?.meta.total ? Math.ceil(data.meta.total / itemsPerPage) : 5}
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
      <h2 className="font-sans text-2xl text-gray-700 mb-10">{t('naatShareef')}</h2>
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
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>
      <div className="mb-5 flex space-x-4">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-lg ${activeCategory === 'all'
            ? 'bg-[#028f4f] text-white'
            : 'bg-white text-[#424242] border border-[#e3e3e3]'
            } transition`}
        >
          {naatsharif_titles("nav.All Naat Shareef")}
        </button>
        <button
          onClick={() => handleCategoryChange('new')}
          className={`px-4 py-2 rounded-lg ${activeCategory === 'new'
            ? 'bg-[#028f4f] text-white'
            : 'bg-white text-[#424242] border border-[#e3e3e3]'
            } transition`}
        >
          {naatsharif_titles("nav.New Naat Shareef")}
        </button>
        <button
          onClick={() => handleCategoryChange('old')}
          className={`px-4 py-2 rounded-lg ${activeCategory === 'old'
            ? 'bg-[#028f4f] text-white'
            : 'bg-white text-[#424242] border border-[#e3e3e3]'
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
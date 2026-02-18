'use client';

import React, { useRef, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { SearchIcon } from 'lucide-react';
import {useRouter} from 'next/navigation';
import playImage from "../../assets/play.png";
import { useFetchMehfilsDataQuery } from '../../../store/slicers/mehfilApi';
import { TranslationKeys } from '../../constants/translationKeys';
interface MehfilItem {
  id: string | number;
  title_ur: string;
  title_en: string;
  created_at: string;
}

const Mehfils = () => {
  const router = useRouter()

  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';   
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const searchPlaceholder = useTranslations(TranslationKeys.SEARCH_PLACEHOLDER);

  const { data, isLoading, isFetching } = useFetchMehfilsDataQuery({
    page: currentPage,
    size: itemsPerPage,
    search: searchQuery,
  });

  const handleSearch = () => {
    setCurrentPage(1);
  };
  const handleNavigation = (item: MehfilItem) => {
    localStorage.setItem('mehfilsData', JSON.stringify(item));
    router.push(`/mehfils/${item.id}`);
  };
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getTitle = (item: any) => {
    return locale === 'ur' ? item.title_ur : item.title_en;
  };

  const renderContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!data?.data || data.data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-black-500 text-xl text-center">
            {t('no_results_found', { query: searchQuery })}
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {t('clear_search')}
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col w-full border-[1px] border-[#e3e3e3] rounded-lg min-h-[200px] bg-white p-5">
          {data.data.map((item) => (
            <div
              key={item.id}
              className="w-full border border-[#e3e3e3] text-base rounded-[5px] bg-white mb-5 hover:bg-[#f6f6f6] hover:text-[#424242] transition"
            >
                <div onClick={() => handleNavigation(item)} className="flex gap-[15px] py-[15px] px-[10px] items-center">
                  <Image
                    src={playImage}
                    alt="Header Image"
                    width={45}
                    height={45}
                  />
                  <h2 className={`text-base font-medium text-gray-700 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
                    {item.id}
                  </h2>
                </div>
                <div className="px-[10px] pb-2">
                  <p className="font-medium text-base text-[#424242]">
                    {getTitle(item)}
                  </p>
                </div>
              {/* </Link> */}
            </div>
          ))}
        </div>
        <Pagination
          count={Math.ceil((data?.meta?.total || 0) / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </>
    );
  };

  return (
    <div ref={containerRef} className="p-5 flex flex-col items-center bg-[#fcf8f5]">
      <h2 className="mb-10 font-sans text-2xl text-gray-700">{t('Mehfils')}</h2>
      <div className="w-full relative mb-8">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon className="w-6 h-6 text-green-600" />
        </div>
        <input
          type="text"
          className="w-full px-[60px] py-[10px] rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder={searchPlaceholder("title")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>
      {renderContent()}
    </div>
  );
};

export default Mehfils;

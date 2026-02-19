'use client';
import React, { useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useGetMessagesQuery } from '../../../store/slicers/messagesApi';
import { TranslationKeys } from '../../constants/translationKeys';

const Messages = () => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 15;

  const { data, isLoading, error } = useGetMessagesQuery({
    page: currentPage,
    size: itemsPerPage,
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getLocalizedContent = (item: MessagesData) => ({
    title: locale === 'ur' ? item.title_ur : item.title_en,
    description: locale === 'ur' ? item.description_ur : item.description_en,
  });

  if (isLoading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-500">Error loading messages</div>;
  }

  return (
    <div ref={containerRef} className="p-5 flex flex-col items-center">
      <h2 className="font-sans text-2xl text-gray-700 mb-4">{t('newMessages')}</h2>
      <div className="mb-5">
        <div className="flex flex-col items-center">
          {data?.data.map((item) => {
            const localizedContent = getLocalizedContent(item);
            return (
              <div
                key={item.id}
                className="max-w-2xl w-full border-[1px] border-[rgba(0,0,0,0.125)] rounded-lg p-5 bg-[#fff8dc] mb-5 hover:shadow-lg transition-shadow"
              >
                <h2
                  className={`text-2xl font-medium text-[#424242] ${
                    locale === 'ur' ? 'font-urdu text-right' : ''
                  }`}
                >
                  {localizedContent.title}
                </h2>
                <p
                  className={`mt-4 text-base text-[#424242] ${
                    locale === 'ur' ? 'font-urdu text-right' : ''
                  }`}
                >
                  {localizedContent.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <Pagination
          count={Math.ceil((data?.meta?.total || 0) / itemsPerPage)}
          page={currentPage}
        onChange={handlePageChange}
        color="primary"
        size="large"
        className={locale === 'ur' ? 'rtl' : ''}
      />
    </div>
  );
};

export default Messages;
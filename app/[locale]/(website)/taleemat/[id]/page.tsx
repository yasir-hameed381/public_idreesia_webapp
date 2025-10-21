"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { HardDriveDownload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const TaleematDetails = () => {
  const searchParams = useSearchParams();
  const taleematData = searchParams.get('data'); 
  const taleemat = taleematData ? JSON.parse(taleematData) : null; 
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en'; 

  if (!taleemat) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>{t('taleemat_not_found')}</p>
        </div>
      </div>
    );
  }

  const getTitle = () => locale === 'ur' ? taleemat.title_ur : taleemat.title_en;

  return (
    <div className="text-center mx-auto max-w-lg p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
        <h1 className={`text-2xl text-black font-bold mb-4 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
          {getTitle()}
        </h1>
        <p className="mb-4">
          <span className="font-bold text-gray-700">{t('created_at')}:</span>{' '}
          <span className="text-gray-600">{taleemat?.created_at}</span>
        </p>
        <div className="border-b border-green-700 my-4"></div>
        {taleemat.filepath && (
          <div className="mb-4">
            <audio controls src={taleemat?.filepath} className="mt-2 w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        <p className="mb-4">
          <span className="font-bold text-gray-700">{t('type')}:</span>{' '}
          <span className="text-gray-600">Taleemat</span>
        </p>
        {taleemat.track && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('track')}:</span>{' '}
            <span className="text-gray-600">{taleemat.track}</span>
          </p>
        )}
        {taleemat.description_en && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('description')}:</span>{' '}
            <span className="text-gray-600">{taleemat.description_en}</span>
          </p>
        )}
        {taleemat.filepath && (
          <div className="mb-4 flex flex-row items-center justify-center text-[#028f4f]">
            <HardDriveDownload />
            <a
              href={taleemat?.filepath}
              download
              className="text-bold inline-block text-[#028f4f] px-4 py-2 rounded transition-colors"
            >
              {t('download_now')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaleematDetails;
"use client"

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HardDriveDownload } from 'lucide-react';
import localforage from 'localforage'; 
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

type DetailsType = 'naatSharif' | 'mehfil' | 'taleemat';

interface DetailProps {
  type: DetailsType;
}

const DetailPage: React.FC<DetailProps> = ({ type }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en'; 

  const [details, setDetails] = useState<any>(null);

  const selectors = {
    naatSharif: (state: any) => state?.naatsharif.singledata,
    mehfil: (state: any) => state?.mehfil.SingleMehfildata,
    taleemat: (state: any) => state?.taleemat.singletaleemdata
  };

  const singleData = useSelector(selectors[type]);

  useEffect(() => {
    const loadData = async () => {
      const storageKey = `${type}Data`;
      const storedDetails = await localforage.getItem(storageKey);

      if (storedDetails) {
        setDetails(storedDetails);
      } else if (singleData) {
        const extractedDetails = Object.values(singleData)[0];
        setDetails(extractedDetails);
        await localforage.setItem(storageKey, extractedDetails);
      }
    };

    loadData();
  }, [singleData, type]);

  if (!details) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>{t(`${type}_not_found`)}</p>
        </div>
      </div>
    );
  }

  const getTitle = () => locale === 'ur' ? details.title_ur : details.title_en;

  return (
    <div className="text-center mx-auto max-w-lg p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
        <h1 className={`text-2xl text-black font-bold mb-4 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
          {getTitle()}
        </h1>

        {details.created_at && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('created_at')}:</span>{' '}
            <span className="text-gray-600">{details.created_at}</span>
          </p>
        )}

        <div className="border-b border-green-700 my-4"></div>

        {details.filepath && (
          <div className="mb-4">
            <audio controls src={details.filepath} className="mt-2 w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <p className="mb-4">
          <span className="font-bold text-gray-700">{t('type')}:</span>{' '}
          <span className="text-gray-600">{details.type || type}</span>
        </p>

        {details.date && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('date')}:</span>{' '}
            <span className="text-gray-600">{details.date}</span>
          </p>
        )}

        {details.track && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('track')}:</span>{' '}
            <span className="text-gray-600">{details.track}</span>
          </p>
        )}

        {details.description_en && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">{t('description')}:</span>{' '}
            <span className="text-gray-600">{details.description_en}</span>
          </p>
        )}

        {details.filepath && (
          <div className="mb-4 flex flex-row items-center justify-center text-[#028f4f]">
            <HardDriveDownload />
            <a
              href={details.filepath}
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

export default DetailPage;
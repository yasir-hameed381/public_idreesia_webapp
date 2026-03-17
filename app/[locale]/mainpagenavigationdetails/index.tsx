"use client";

import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RootState } from '@/store/store';

const Index = () => {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';

  const t = useTranslations('common');

  const searchDetails = useSelector((state: RootState) => state?.search?.searchDetails);

 const  title = searchDetails


  const getTitle = (title: any) => {
    return locale === 'ur' ? title.title_ur : title.title_en;
  };
  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-black">All Search Details</h1>
        {searchDetails?.id && (
          <p className="text-black">
            <strong>ID:</strong> {searchDetails.id}
          </p>
        )}
       
          <p className={`text-2xl text-black font-bold mb-4 ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>

          {getTitle(title)}
       
          </p>
        
        {searchDetails?.track && (
          <p className="text-black">
            <strong>Track:</strong> {searchDetails.track}
          </p>
        )}
        {searchDetails?.filepath && (
          <div className="mb-4">
            <audio controls src={searchDetails.filepath} className="mt-2 w-full">
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
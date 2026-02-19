'use client'


import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HardDriveDownload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import localforage from 'localforage'; 

const MehfilDetails = () => {
  const SingleMehfildata = useSelector((state) => state?.mehfil.SingleMehfildata);
  
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en'; 

  const [mehfil, setMehfil] = useState(null);

  useEffect(() => {
    const loadMehfilData = async () => {
      const storedMehfil = await localforage.getItem('mehfilData');
      if (storedMehfil) {
        setMehfil(storedMehfil);
      } else if (SingleMehfildata) {
        const mehfilData = Object.values(SingleMehfildata)[0];
        setMehfil(mehfilData);
        await localforage.setItem('mehfilData', mehfilData);
      }
    };
    loadMehfilData();
  }, [SingleMehfildata]);

  const getTitle = () => locale === 'ur' ? mehfil.title_ur : mehfil.title_en;

  if (!mehfil) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Mehfil not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mx-auto max-w-lg p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
        <h1 className={`mb-4 font-sans text-2xl ${locale === 'ur' ? 'font-urdu text-right' : ''}`}>
          {getTitle()}
        </h1>
        <div className="border-b border-green-700 my-4"></div>
        {mehfil.filepath && (
          <div className="mb-4">
            <audio controls src={mehfil?.filepath} className="mt-2 w-full" />
          </div>
        )}
        <p className="mb-4">
          <span className="font-bold text-gray-700">Type:</span>{' '}
          <span className="text-gray-600">{mehfil?.type}</span>
        </p>
        {mehfil.date && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">Date:</span>{' '}
            <span className="text-gray-600">{mehfil.date}</span>
          </p>
        )}
        {mehfil.description_en && (
          <p className="mb-4">
            <span className="font-bold text-gray-700">Description:</span>{' '}
            <span className="text-gray-600">{mehfil.description_en}</span>
          </p>
        )}
        {mehfil.filepath && (
          <div className="mb-4 flex flex-row items-center justify-center text-[#028f4f]">
            <HardDriveDownload />
            <a
              href={mehfil?.filepath}
              download
              className="text-bold inline-block text-[#028f4f] px-4 py-2 rounded transition-colors"
            >
              Download Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


export default MehfilDetails;

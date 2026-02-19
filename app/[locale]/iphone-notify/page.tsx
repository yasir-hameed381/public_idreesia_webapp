"use client";


import React from 'react'
import ReactPlayer from 'react-player'
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { TranslationKeys } from '../../constants/translationKeys';

const Index = () => {
  const t = useTranslations(TranslationKeys.NOTIFICATIONS);

  const language = useSelector((state: RootState) => state.language.language);

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h2 className="text-center text-xl mb-4 border-b-2 border-green-700 pb-2 text-black">

        {t('Iphone')
 }     </h2>
      <ReactPlayer
        className='relative'
        url='/video/notification-iphone (1).mp4'
        width='30%'
        height='50%'
        controls={true}
      />
    </div>
  )
}






export default Index

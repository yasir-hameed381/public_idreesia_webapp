
import React from 'react';
import { useTranslations } from 'next-intl';
import { TranslationKeys } from '@/app/constants/translationKeys';
import PhoneIcon from '@/app/assets/svg/phone';
import LocationIcon from '@/app/assets/svg/location';
import BuildingIcon from '@/app/assets/svg/building';


const ContactPage = () => {
  const t = useTranslations(TranslationKeys.ABOUT);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-3xl mx-auto text-center">
     
        <h2 className='text-center text-[24px] mb-4  text-[#424242] ' >
        {t(`title`)}


        </h2>
        <h2 className="text-center text-[24px] mb-4 border-b-2 border-green-700 pb-2text-[#0e202a] ">
        </h2>
        <div className="space-y-2 mb-8">
          <a
            href="https://wa.me/061111111381"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-lg text-emerald-600 hover:text-emerald-700"
          >
            <PhoneIcon className={"h-5 w-5 mr-2"} />
            061-111-111-381
          </a>          
          <a
            href="https://maps.app.goo.gl/r6n2rURPfiMkmoUC9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-lg text-emerald-600 hover:text-emerald-700"
          >
            <LocationIcon className={"h-5 w-5 mr-2"} />           
            {t(`address`)}
          </a>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Head Office</h2>
          <div className="flex items-center justify-center text-lg text-gray-700">
            <BuildingIcon className={"h-5 w-5 mr-2"}/>
            366-A, Shah Rukn-e-Alam Colony, Multan, Pakistan
          </div>
        </div>
      </div>
    </div>
  );
};




export default ContactPage;
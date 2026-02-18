import React from 'react';
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from 'next';
const ContactPage = () => {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-3xl mx-auto text-center">
     
        <h2 className='text-center text-[24px] mb-4 ' >
        {t(`about_us.heading`)}


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
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
              />
            </svg>
            061-111-111-381
          </a>
          
          <a
            href="https://maps.app.goo.gl/r6n2rURPfiMkmoUC9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-lg text-emerald-600 hover:text-emerald-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            {t(`contact.address`)}
          </a>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Head Office</h2>
          <div className="flex items-center justify-center text-lg text-gray-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
            366-A, Shah Rukn-e-Alam Colony, Multan, Pakistan
          </div>
        </div>
      </div>
    </div>
  );
};


export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};



export default ContactPage;
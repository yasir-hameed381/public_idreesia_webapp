import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { shallowEqual } from 'shallow-equal';
import { HardDriveDownload } from 'lucide-react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from 'next/router';
import localforage from 'localforage';
import { TranslationKeys } from "../../constants/translationKeys";

interface Content {
  title_ur?: string;
  title_en?: string;
  description_ur?: string;
  description_en?: string;
  created_at?: string;
  filepath?: string;
  type?: string;
  track?: string;
}

interface RootState {
  taleemat: { alltaleematdata: Record<string, Content> };
  naatsharif: { data: Record<string, Content> };
  mehfil: { allMehfildata: Record<string, Content> };
}

const DetailPage = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { locale = 'en' } = router;
  const { t } = useTranslation(TranslationKeys.COMMON);


  const { taleematData, naatSharifData, mehfilData } = useSelector(
    (state: RootState) => ({
      taleematData: state?.taleemat?.alltaleematdata,
      naatSharifData: state?.naatsharif?.data,
      mehfilData: state?.mehfil?.allMehfildata,
    }),
    shallowEqual
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedContent = await localforage.getItem<Content>('contentData');
        
        if (storedContent) {
          setContent(storedContent);
        } else {
          const selectedContent =
            Object.values(taleematData || {})[0] ||
            Object.values(naatSharifData || {})[0] ||
            Object.values(mehfilData || {})[0];

          if (selectedContent) {
            await localforage.setItem('contentData', selectedContent);
            setContent(selectedContent);
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [taleematData, naatSharifData, mehfilData]);

  const getLocalizedText = (urText?: string, enText?: string) => 
    locale === 'ur' ? urText : enText;

  const AudioPlayer = ({ src }: { src: string }) => (
    <div className="mb-4">
      <audio controls src={src} className="mt-2 w-full">
        Your browser does not support the audio element.
      </audio>
    </div>
  );

  const MetadataField = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <p className="mb-4">
        <span className="font-bold text-gray-700">{label}:</span>{' '}
        <span className="text-gray-600">{value}</span>
      </p>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center p-4 mt-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>{t('content_not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mx-auto max-w-lg p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 border border-green-100">
        <h1 
          className={`text-2xl text-black font-bold mb-4 ${
            locale === 'ur' ? 'font-urdu text-right' : ''
          }`}
        >
          {getLocalizedText(content.title_ur, content.title_en)}
        </h1>
        
        {content.created_at && (
          <p className="mb-4 text-gray-600">{content.created_at}</p>
        )}
        
        <div className="border-b border-green-700 my-4"></div>
        
        {content.filepath && <AudioPlayer src={content.filepath} />}
        
        <MetadataField label={t('details.type')} value={content.type} />
        <MetadataField label={t('details.track')} value={content.track} />
        
        <MetadataField 
          label={t('details.description')} 
          value={getLocalizedText(content.description_ur, content.description_en)} 
        />

        {content.filepath && (
          <div className="mb-4 flex flex-row items-center justify-center text-[#028f4f] hover:text-green-700 transition-colors">
            <HardDriveDownload className="mr-2" />
            <a
              href={content.filepath}
              download
              className="text-bold inline-block px-4 py-2 rounded"
            >
              {t('download_now')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default DetailPage;
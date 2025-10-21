'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface Wazaif {
  id: number;
  title_en: string;
  title_ur: string;
  images: string | string[];
}

export default function WazaifDetails() {
  const [wazaif, setWazaif] = useState<Wazaif | null>(null);
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const params = useParams();

  useEffect(() => {
    const storedData = localStorage.getItem('wazaifDetail');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.id === Number(params?.id)) {
        console.log("images",parsedData.images)
        setWazaif(parsedData);
      }
    }
  }, [params?.id]);

  const getTitle = () => wazaif ? (locale === 'ur' ? wazaif.title_ur : wazaif.title_en) : '';

  if (!params?.id || !wazaif) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const getImageUrls = () => {
    try {
      // Handle different cases of image data format
      if (!wazaif.images) return [];
      
      if (Array.isArray(wazaif.images)) {
        return wazaif.images;
      }

      // Handle string that might be JSON
      const parsed = JSON.parse(wazaif.images);
      
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // Handle case where it's a single string URL
      return wazaif.images;
    } catch (e) {
      console.error("Error parsing images:", e);
      return [];
    }
  };

  const imageUrls: any = getImageUrls();

  // Clean up image URLs by removing escape characters
  const cleanedImageUrls = imageUrls.map((url: any) => 
    typeof url === 'string' 
      ? url.replace(/\\\//g, '/') // Replace all \/ with /
      : url
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-center w-full">
        <h1 className="text-2xl font-semibold mb-6 text-black">{getTitle()}</h1>
      </div>

      <div className="grid gap-4">
        {cleanedImageUrls.map((image: string, index: number) => {
          console.log("Map-iamges",image)
          return (
            
            <div key={index} className="flex justify-center relative w-full">
              <img 
                src={image} 
                alt={`wazaif-${index}`} 
                className="max-w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}





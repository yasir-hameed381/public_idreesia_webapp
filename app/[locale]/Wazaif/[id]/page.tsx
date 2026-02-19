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
        setWazaif(parsedData);
      }
    }
  }, [params?.id]);

  const getTitle = () => wazaif ? (locale === 'ur' ? wazaif.title_ur : wazaif.title_en) : '';

  if (!params?.id || !wazaif) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const images = Array.isArray(wazaif.images)
    ? wazaif.images
    : JSON.parse(wazaif.images || "[]");

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-center w-full">
        <h1 className="text-2xl font-semibold mb-6 text-black">{getTitle()}</h1>
      </div>

      <div className="grid gap-4">
        {images.map((image: string, index: number) => (
          <div key={index} className="flex justify-center relative w-full">
            <img src={`${image}`} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Navigation from "@/components/Navigation";
import { TranslationKeys } from "@/app/constants/translationKeys";

interface Wazaif {
  id: number;
  title_en: string;
  title_ur: string;
  slug?: string;
  description?: string;
  description_en?: string;
  images: string | string[];
  category?: string;
  is_published?: number;
  is_for_karkun?: number;
  is_for_ehad_karkun?: number;
  wazaif_number?: string;
  created_at?: string;
  updated_at?: string;
}

export default function WazaifDetails() {
  const [wazaif, setWazaif] = useState<Wazaif | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("wazaifDetail");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const paramId = params?.id as string;

        // Check if params.id matches either the id, slug, or wazaif_number
        const isMatch =
          parsedData.id === Number(paramId) ||
          parsedData.slug === paramId ||
          parsedData.id.toString() === paramId;

        if (isMatch) {
          setWazaif(parsedData);
        } else {
          console.warn("Stored wazaif data doesn't match current ID/slug:", {
            storedId: parsedData.id,
            storedSlug: parsedData.slug,
            paramId,
          });
        }
      } catch (error) {
        console.error("Error parsing wazaif data:", error);
      }
    } else {
      console.warn("No wazaif data found in localStorage");
    }
    setIsLoading(false);
  }, [params?.id]);

  const getTitle = () =>
    wazaif ? (locale === "ur" ? wazaif.title_ur : wazaif.title_en) : "";

  const getDescription = () => {
    if (!wazaif) return "";
    return locale === "ur"
      ? wazaif.description || wazaif.description_en || ""
      : wazaif.description_en || wazaif.description || "";
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return "";
    const categoryMap: Record<string, { en: string; ur: string }> = {
      bunyadi: { en: "Bunyadi Wazaif", ur: "بنیادی وظائف" },
      notice_board_taleem: {
        en: "Notice Board Taleem",
        ur: "نوٹس بورڈ تعلیمات",
      },
      parhaiyan: { en: "Parhaiyan", ur: "پڑھائیں" },
      wazaif: { en: "Wazaifaa", ur: "وظائف" },
    };
    const label = categoryMap[category] || { en: category, ur: category };
    return locale === "ur" ? label.ur : label.en;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  if (!params?.id || !wazaif) {
    return (
      <>
        <Navigation />
        <div className="max-w-3xl mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {locale === "ur" ? "وظیفہ نہیں ملا" : "Wazaif not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{locale === "ur" ? "واپس جائیں" : "Go Back"}</span>
            </button>
          </div>
        </div>
      </>
    );
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
      return [wazaif.images];
    } catch (e) {
      console.error("Error parsing images:", e);
      // If parsing fails, try to use as single URL
      if (
        typeof wazaif.images === "string" &&
        wazaif.images.startsWith("http")
      ) {
        return [wazaif.images];
      }
      return [];
    }
  };

  const imageUrls: any = getImageUrls();

  // Clean up image URLs by removing escape characters
  const cleanedImageUrls = imageUrls.map((url: any) =>
    typeof url === "string"
      ? url.replace(/\\\//g, "/") // Replace all \/ with /
      : url
  );

  const description = getDescription();

  return (
    <>
      <Navigation />
      <div className="bg-[#fcf8f5] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">
              {locale === "ur" ? "واپس" : "Back"}
            </span>
          </button>

          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <h1
                className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-4 ${
                  locale === "ur" ? "font-urdu text-right" : ""
                }`}
              >
                {getTitle()}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Category Badge */}
                {wazaif.category && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Tag className="w-4 h-4" />
                    <span>{getCategoryLabel(wazaif.category)}</span>
                  </div>
                )}

                {/* Karkun Badge */}
                {wazaif.is_for_karkun === 1 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {locale === "ur" ? "کارکن کے لیے" : "For Karkun"}
                  </span>
                )}

                {/* Ehad Karkun Badge */}
                {wazaif.is_for_ehad_karkun === 1 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {locale === "ur" ? "عہد کارکن کے لیے" : "For Ehad Karkun"}
                  </span>
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="mt-4">
                  <p
                    className={`text-gray-700 leading-relaxed ${
                      locale === "ur" ? "font-urdu text-right" : ""
                    }`}
                  >
                    {description}
                  </p>
                </div>
              )}

              {/* Date Information */}
              {wazaif.created_at && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(wazaif.created_at).toLocaleDateString(
                      locale === "ur" ? "ur-PK" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Images Section */}
            {cleanedImageUrls.length > 0 && (
              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  {cleanedImageUrls.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="flex justify-center relative w-full"
                    >
                      <img
                        src={image}
                        alt={`${getTitle()} - ${index + 1}`}
                        className="max-w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                        onError={(e) => {
                          console.error("Failed to load image:", image);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Images Message */}
            {cleanedImageUrls.length === 0 && (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <p>
                  {locale === "ur"
                    ? "کوئی تصاویر دستیاب نہیں ہیں"
                    : "No images available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

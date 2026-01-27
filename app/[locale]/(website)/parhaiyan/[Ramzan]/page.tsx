"use client";
import RamzanForm from "@/components/RamzanForm";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetParhaiyanBySlugQuery } from "@/store/slicers/parhaiyanApi";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import { Clock, Home } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

// Helper function to check if parhaiyan is active
function isParhaiyanActive(parhaiyan: Parhaiyan): boolean {
  if (!parhaiyan.is_active) {
    return false;
  }

  const now = new Date();
  const startDate = parhaiyan.start_date ? new Date(parhaiyan.start_date) : null;
  const endDate = parhaiyan.end_date ? new Date(parhaiyan.end_date) : null;

  if (!startDate || !endDate) {
    return false;
  }

  return now >= startDate && now <= endDate;
}

export default function ParhaiyanPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params.Ramzan as string;
  const [parhaiyanData, setParhaiyanData] = useState<Parhaiyan | null>(null);

  // Fetch parhaiyan by slug from API (dynamic data from database)
  const {
    data: parhaiyanResponse,
    isLoading,
    isError,
  } = useGetParhaiyanBySlugQuery(slug, {
    skip: !slug,
  });

  // Update parhaiyan data when API response is received
  useEffect(() => {
    if (parhaiyanResponse?.data) {
      setParhaiyanData(parhaiyanResponse.data);
    }
  }, [parhaiyanResponse]);

  const getLocalizedText = (enText?: string, urText?: string) =>
    locale === 'ur' ? urText || enText : enText || urText;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-[#6bb179] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !parhaiyanData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Parhaiyan Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The parhaiyan form you are looking for does not exist.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if parhaiyan is active
  const isActive = isParhaiyanActive(parhaiyanData);

  // Show closed UI if not active
  if (!isActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 border border-gray-200 dark:border-gray-700 text-center">
            {/* Clock Icon */}
            <div className="mb-6">
              <Clock className="size-20 text-amber-500 dark:text-amber-400 mx-auto" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {getLocalizedText(parhaiyanData.title_en, parhaiyanData.title_ur)}
            </h1>

            {/* Closed Status */}
            <h2 className="text-xl text-amber-600 dark:text-amber-500 mb-4 font-semibold">
              Parhaiyan Closed
            </h2>

            {/* Message */}
            <div className="prose dark:prose-invert mb-8 mx-auto max-w-none">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                This recitation form is not currently active. Please call{" "}
                <a
                  href="tel:061-111-111-381"
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold underline"
                >
                  061-111-111-381
                </a>{" "}
                for more information.
              </p>
            </div>

            {/* Back to Home Button */}
            <div className="mt-8">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors font-medium"
              >
                <Home size={20} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show form if active
  return <RamzanForm parhaiyan={parhaiyanData} />;
}

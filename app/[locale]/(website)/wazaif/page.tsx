"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import readImage from "../../../assets/read.png";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { TranslationKeys } from "@/app/constants/translationKeys";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import LoadingSpinner from "@/components/ui/Loadingspinner";

function WazaifList() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations(TranslationKeys.ALL_TITLES);

  const { data, isLoading, error } = useGetWazaifQuery({ page: 1, size: 10 });

  const getLocalizedContent = (item: any) => {
    return locale === "ur" ? item.title_ur : item.title_en;
  };

  const handleWazaifClick = (item: any) => {
    localStorage.setItem("wazaifDetail", JSON.stringify(item));
  };

  if (isLoading) {
    return (
      <LoadingSpinner/>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center p-4 text-red-500 ${
          locale === "ur" ? "font-urdu text-right" : ""
        }`}
      >
        {t("error")}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#fcf8f5]">
      <h1 className="font-sans text-2xl text-gray-700 mb-6 text-center">
        {t("wazaif")}
      </h1>

      <div className="space-y-2">
        {data?.data.map((item) => (
          <Link
            key={item.id}
            href={`/wazaif/${item.id}`}
            onClick={() => handleWazaifClick(item)}
            className={`flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 ${
              locale === "ur" ? "flex-row-reverse" : ""
            }`}
          >
            <Image src={readImage} alt="Header Image" width={45} height={45} />
            <span
              className={`text-gray-700 font-medium mr-[15px] ml-[15px] ${
                locale === "ur" ? "text-right" : ""
              }`}
            >
              {getLocalizedContent(item)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default WazaifList;

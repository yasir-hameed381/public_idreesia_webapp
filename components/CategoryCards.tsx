"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import allahImage from "../app/assets/allah-allah-white.png";
import duroodImage from "../app/assets/durood-white.png";
import lailahImage from "../app/assets/lailah-white.png";
import astaghfirullahImage from "../app/assets/astaghfirullah-white.png";

const CategoryCards = () => {
  const locale = useLocale();
  const t = useTranslations();

  const cards = [
    {
      id: "mehfils",
      title: locale === "ur" ? "محافل" : "Mehfils",
      titleKey: "text.mehfil",
      description: locale === "ur" 
        ? "روحانی روشنی اور برکت بخش تعلیمات کے لیے باقاعدہ اجتماعات میں شامل ہوں"
        : "Join regular gatherings for spiritual enlightenment and blessed teachings",
      descriptionKey: "text.mehfil-description",
      href: `/${locale === "ur" ? "ur/" : ""}mehfils`,
      icon: allahImage,
      iconAlt: "Mehfils",
      gradientFrom: "from-[#2D7A4A]",
      gradientTo: "to-[#236339]",
      accentColor: "text-[#2D7A4A]",
      accentBg: "bg-gradient-to-r from-[#2D7A4A] to-transparent",
    },
    {
      id: "naat",
      title: locale === "ur" ? "نعت شریف" : "Naat Shareef",
      titleKey: "text.naatshareef",
      description: locale === "ur"
        ? "نبی کریم صلی اللہ علیہ وسلم کی تعریف میں خوبصورت تلاوت سنیں"
        : "Listen to beautiful recitations in praise of the Prophet صلى الله عليم وسلم",
      descriptionKey: "text.naat-description",
      href: `/${locale === "ur" ? "ur/" : ""}naatsharif`,
      icon: duroodImage,
      iconAlt: "Naat Shareefs",
      gradientFrom: "from-[#DBB040]",
      gradientTo: "to-[#C9A03A]",
      accentColor: "text-[#DBB040]",
      accentBg: "bg-gradient-to-r from-[#DBB040] to-transparent",
    },
    {
      id: "taleemat",
      title: locale === "ur" ? "تلیمات" : "Taleemat",
      titleKey: "text.taleemat",
      description: locale === "ur"
        ? "سب کے لیے بے بہا روحانی تعلیمات اور رہنمائی تک رسائی حاصل کریں"
        : "Access invaluable spiritual teachings and guidance for all",
      descriptionKey: "text.taleem-description",
      href: `/${locale === "ur" ? "ur/" : ""}taleemat`,
      icon: lailahImage,
      iconAlt: "Taleemat",
      gradientFrom: "from-[#1E3A5F]",
      gradientTo: "to-[#152B47]",
      accentColor: "text-[#1E3A5F]",
      accentBg: "bg-gradient-to-r from-[#1E3A5F] to-transparent",
    },
    {
      id: "wazaif",
      title: locale === "ur" ? "وظائف" : "Wazaif",
      titleKey: "text.wazaif",
      description: locale === "ur"
        ? "روحانی ترقی کے لیے طاقتور دعائیں اور تلاوت دریافت کریں"
        : "Discover powerful supplications and recitations for spiritual growth",
      descriptionKey: "text.wazaif-description",
      href: `/${locale === "ur" ? "ur/" : ""}wazaif`,
      icon: astaghfirullahImage,
      iconAlt: "Wazaif",
      gradientFrom: "from-[#E88D5C]",
      gradientTo: "to-[#D67A4C]",
      accentColor: "text-[#E88D5C]",
      accentBg: "bg-gradient-to-r from-[#E88D5C] to-transparent",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="category-card group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-500 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Decorative gradient background */}
              <div
                className={`absolute top-0 left-0 rtl:left-auto rtl:right-0 w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br ${card.gradientFrom}/10 to-transparent rounded-br-[100px] rtl:rounded-br-none rtl:rounded-bl-[100px]`}
              ></div>

              <div className="relative p-5 sm:p-6 md:p-7">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 p-3`}
                  >
                    <Image
                      src={card.icon}
                      alt={card.iconAlt}
                      className="w-full h-full object-contain"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 transition-colors ${
                        card.id === "mehfils" 
                          ? "text-[#2D7A4A]" 
                          : card.id === "naat" 
                          ? "text-[#DBB040]"
                          : card.id === "taleemat" 
                          ? "text-[#1E3A5F]"
                          : "text-[#E88D5C]"
                      }`}
                    >
                      {card.title}
                    </h3>
                    <div
                      className={`h-1 w-10 sm:w-12 ${card.accentBg} rounded-full`}
                    ></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 mb-3 sm:mb-4">
                  {card.description}
                </p>

                {/* Listen Link */}
                <div
                  className={`flex items-center ${card.accentColor} font-semibold text-sm md:text-base group-hover:gap-3 gap-2 transition-all`}
                >
                  <span>{locale === "ur" ? "سنو" : "Listen"}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;

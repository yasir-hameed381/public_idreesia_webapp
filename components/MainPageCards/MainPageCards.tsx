"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "@/app/constants/translationKeys";
import KarkunanCard from "./karkunanCards";
const MainPageCards = () => {
  const t = useTranslations(TranslationKeys.ALL_TITLES);
  const tButton = useTranslations(TranslationKeys.DASHBOARD_CARDS);

  const cards = [
    {
      id: "mehfil-report",
      href: "/mehfil-report",
      borderColor: "border-green-600",
      titleKey: "mehfilReport",
    },
    {
      id: "new-ehad",
      href: "/new-ehad",
      borderColor: "border-yellow-600",
      titleKey: "newEhad",
    },
    {
      id: "attendance-karkunan",
      href: "/attendance-karkunan",
      borderColor: "border-red-600",
      titleKey: "attendanceKarkunan",
    },
    {
      id: "attendance-ehad-karkunan",
      href: "/attendance-ehad-karkunan",
      borderColor: "border-purple-600",
      titleKey: "attendanceEhadKarkunan",
    },
  ];

  return (
    <div className="w-full flex flex-wrap justify-center gap-6 my-8 px-4">
      {cards.map((card) => (
        <KarkunanCard
          key={card.id}
          href={card.href}
          title={t(card.titleKey)}
          buttonText={tButton(`${card.id}.button`)}
          borderColor={card.borderColor}
        />
      ))}
    </div>
  );
};

export default MainPageCards;

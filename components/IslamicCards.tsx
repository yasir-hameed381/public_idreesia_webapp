"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "../app/constants/translationKeys";
import image1 from "../app/assets/allah-allah-white.png";
import image2 from "../app/assets/lailah-white.png";
import image3 from "../app/assets/durood-white.png";
import image4 from "../app/assets/astaghfirullah-white.png";
import background1 from "../app/assets/Background1.png";
import arrowBack from "../app/assets/ArrowButtonback.png";
import arrowForward from "../app/assets/ArrowButton.png";

const IslamicCards = () => {
  const t = useTranslations(TranslationKeys.MAIN_CARDS_NAVIGATION_TITLE);
  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();

  const cards = [
    {
      id: 1,
      imageUrl: image1,
      label: "Mehfils",
      gradient: "bg-gradient-to-b from-[#028f4f] to-[#1e3924]",
      labelColor: "text-[#424242]",
      borderColor: "border-[#028f4f]",
      href: "/mehfils",
      hoverColor: "group-hover:text-[#028F4F]",
    },
    {
      id: 2,
      imageUrl: image2,
      label: "Taleemat",
      gradient: "bg-gradient-to-b from-[#0b2d52] to-[#0e1e32]",
      labelColor: "text-[#424242]",
      borderColor: "border-[#0b2d52]",
      href: "/taleemat",
      hoverColor: "group-hover:text-[#0b2d52]",
    },
    {
      id: 3,
      imageUrl: image3,
      label: "Naat Shareef",
      gradient: "bg-gradient-to-b from-[#efc54f] to-[#d2a736]",
      labelColor: "text-[#424242]",
      borderColor: "border-[#efc54f]",
      href: "/naatsharif",
      hoverColor: "group-hover:text-[#efc54f]",
    },
    {
      id: 4,
      imageUrl: image4,
      label: "Wazaif",
      gradient: "bg-gradient-to-b from-[#f29d65] to-[#f58520]",
      labelColor: "text-[#424242]",
      borderColor: "border-[#f29d65]",
      href: "/wazaif",
      hoverColor: "group-hover:text-[#f29d65]",
    },
  ];

  const handleNavigation = (e, href) => {
    e.preventDefault();
    router.push(href);
  };

  const cardsPerSlide = 3;
  const totalSlides = Math.ceil(cards.length / cardsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentCards = () => {
    const startIndex = currentSlide * cardsPerSlide;
    return cards.slice(startIndex, startIndex + cardsPerSlide);
  };

  return (
    <div className="relative w-full py-16">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden">
          <div className="flex justify-center items-start gap-12 relative">
            {getCurrentCards().map((card, index) => (
              <div
                key={card.id}
                className="flex flex-col items-center gap-4 group cursor-pointer transition-all duration-300 transform hover:scale-102"
                onClick={(e) => handleNavigation(e, card.href)}
              >
                <div
                  className="relative w-[320px] h-[280px] rounded-2xl overflow-hidden"
                  style={{
                    backgroundImage: `url(${background1.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#026419",
                  }}
                >
                  <Image
                    src={card.imageUrl}
                    alt={card.label}
                    fill
                    className="absolute inset-0 p-8 object-contain"
                  />
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <p className="text-white text-xl font-semibold">
                      {t(`nav.${card.label}`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons positioned outside the cards */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
            <button
              onClick={prevSlide}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image src={arrowBack} alt="Previous" className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <button
              onClick={nextSlide}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image src={arrowForward} alt="Next" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicCards;

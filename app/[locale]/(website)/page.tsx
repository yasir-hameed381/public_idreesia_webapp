import { getTranslations } from "next-intl/server";
import { TranslationKeys } from "../../constants/translationKeys";
import centerImage from "../../assets/centered-border.png";
import heroImage from "../../assets/gallery-images/image_8.png";

import Image from "next/image";
import RamzanCard from "@/components/RamzanCard";
import MehfilAddressCard from "@/components/Mehfil-Address";
import Navigation from "@/components/Navigation";
import IslamicCards from "@/components/IslamicCards";
import MobileAppShowcase from "@/components/MainPageCards/MobileAppShowCase";
import LatestMessage from "@/components/MainPageCards/LatestMessage";
import SearchInterface from "@/components/SearchInterface";
import ScrollToTop from "@/components/ScrollToTop";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  const t = (await getTranslations({
    locale,
    namespace: TranslationKeys.HOME_PAGE,
  })) as (key: string) => string;

  return (
    <>
      <Navigation />
      <SearchInterface />

      {/* Hero Section */}
      <div className="w-full">
        <Image
          src={heroImage}
          alt="Hero Section"
          priority
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2
            className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl"
            style={{
              color: "#026419",
              fontFamily: "Poppins",
              fontWeight: 700,
              lineHeight: "120%",
            }}
          >
            {t("journey.title")}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-700 px-4">
            {t("journey.content")}
          </p>
          <div className="flex justify-center mt-6 md:mt-8">
            <Image
              src={centerImage}
              alt="Centered Border"
              className="w-auto h-auto"
            />
          </div>
        </div>
      </div>

      {/* Ramzan Card Section */}
      <div className="container mx-auto px-4">
        <RamzanCard />

        {/* Spiritual Treasures Section */}
        <div className="py-8 md:py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl"
              style={{
                color: "#026419",
                fontFamily: "Poppins",
                fontWeight: 700,
                lineHeight: "120%",
              }}
            >
              {t("treasures.title")}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-gray-700 px-4">
              {t("treasures.content")}
            </p>
          </div>
        </div>

        <IslamicCards />

        {/* Additional Section */}
        <section className="text-center flex flex-col gap-5 items-center my-12 md:my-16 justify-center px-4">
          <h2
            className="mb-4 text-2xl md:text-3xl lg:text-4xl font-medium"
            style={{
              color: "#026419",
              fontFamily: "Poppins",
              fontWeight: 700,
              lineHeight: "120%",
            }}
          >
            {t("desc2.title")}
          </h2>
          <p className="text-base md:text-lg max-w-full lg:max-w-[60%] leading-relaxed text-gray-700">
            {t("desc2.content")}
          </p>
          <div className="mt-4">
            <Image
              src={centerImage}
              alt="centerImage"
              className="w-auto h-auto"
            />
          </div>
        </section>

        {/* Mobile App Showcase */}
        <div className="mt-16 md:mt-24 mb-12">
          <MobileAppShowcase />
        </div>

        {/* Latest Message & Mehfil Address */}
        <LatestMessage />
        <MehfilAddressCard />
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}

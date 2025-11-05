import { useTranslations } from "next-intl";
import { TranslationKeys } from "../../constants/translationKeys";
import centerImage from "../../assets/centered-border.png";
import heroImage from "../../assets/gallery-images/image_8.png";

import Image from "next/image";
// import Ramzan2025Page from "./parhaiyan/Ramzan-2025/page";
import RamzanCard from "@/components/RamzanCard";
import MehfilAddressCard from "@/components/Mehfil-Address";
import Navigation from "@/components/Navigation";
import IslamicCards from "@/components/IslamicCards";
import MobileAppShowcase from "@/components/MainPageCards/MobileAppShowCase";
import LatestMessage from "@/components/MainPageCards/LatestMessage";
import SearchInterface from "@/components/SearchInterface";
export default function HomePage() {
  const t = useTranslations(TranslationKeys.HOME_PAGE);
  const dashboard_t = useTranslations(TranslationKeys.DASHBOARD_CARDS);

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
            How The Idreesia Journey Began
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-700 px-4">
            Silsila Muhammadia Ameenia Idreesia began in Pakistan when
            Al-Mohtaram Al-Mukarram Al-Sayyedi Al-Hafiz Al-Shaikh Muhammad Amin
            bin Abdur Rahman arrived in Pakistan from Madinah Munawwarah. The
            primary purpose of this spiritual path is to guide people toward
            obedience to Allah Almighty and the Prophet ﷺ, instilling in their
            hearts the love and greatness of Allah Almighty and the Prophet ﷺ.
            To achieve these goals, reading Durood Shareef, Zikr, and wazaif are
            given. Additionally, the invaluable treasure of Allah Almighty's and
            the Prophet's ﷺ teachings is preserved in the form of recordings by
            Mohtaram Shaikh Sahab as a guidance for all until the day of
            judgement.
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
              Discover the Spiritual Treasures of Idreesia
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-gray-700 px-4">
              Immerse yourself in the sacred atmosphere of Idreesia, where
              Mehfils illuminate hearts, Taleemat offer timeless guidance, Naats
              echo with love for the Prophet ﷺ, and Wazaif provide spiritual
              solace. Whether you're seeking deeper understanding or divine
              connection, Idreesia.com is your gateway to authentic spiritual
              nourishment.
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
    </>
  );
}

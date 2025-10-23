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
export default function HomePage() {
  const t = useTranslations(TranslationKeys.HOME_PAGE);
  const dashboard_t = useTranslations(TranslationKeys.DASHBOARD_CARDS);

  return (
    <>
      <Navigation />
      <div className="w-full">
        <Image
          src={heroImage}
          alt="Hero Section"
          priority
          className="w-full object-cover"
        />
      </div>

      <div className="container mx-auto py-12">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h2
            className="mb-6 text-center"
            style={{
              color: "#026419",
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "34px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            How The Idreesia Journey Began
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
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
          <div className="flex justify-center mt-8">
            <Image src={centerImage} alt="Centered Border" />
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        {/* <MainPageCards /> */}
        {/* <section className="text-center flex flex-col gap-2 items-center justify-center">
          <p className="text-16 font-sans max-w-[60%] text-red-500 font-bold">
            {dashboard_t("coming-soon.title")}
          </p>
        </section> */}

        <RamzanCard />

        <div className="container mx-auto py-12">
          <div className="text-center max-w-4xl mx-auto px-6">
            <h2
              className="mb-6 text-center"
              style={{
                color: "#026419",
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "34px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Discover the Spiritual Treasures of Idreesia
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
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

        <section className="text-center flex flex-col gap-5 items-center my-[60px] justify-center">
          <h1
            style={{
              color: "#026419",
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: "34px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
            className=" mb-5  font-medium"
          >
            {t("desc2.title")}
          </h1>
          <p className="text-lg lg:max-w-[60%] leading-relaxed text-gray-700">
            {t("desc2.content")}
          </p>
          <Image src={centerImage} alt="centerImage" />
        </section>
        <div className="mt-[100px]">
          <MobileAppShowcase />
        </div>
        <LatestMessage />
        <MehfilAddressCard />
        {/* </section> */}
        {/* <section className="text-center flex flex-col gap-2 items-center justify-center">
          <p className="text-16 font-sans max-w-[60%] text-black">
            {t("desc1")}
          </p>
          <Image src={centerImage} alt="centerImage" />
        </section> */}
        {/* 
        <MainPageNavigationSearch /> */}
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import UrduIdreesiaLogo from "../app/assets/logo1.png";
import footerlogo from "../app/assets/footerlogo.png";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "../app/constants/translationKeys";
import footerMask from "../app/assets/footerMask.png";
import whatsapp from "../app/assets/WhatsApp.png";
import playStore from "../app/assets/Google Play.png";
import appStore from "../app/assets/App Store.png";
import YouTube from "../app/assets/Youtub.png";
import line from "../app/assets/Line 4.png";

export default function Footer() {
  const language = useSelector((state: any) => state.language.language);
  const router = useRouter();
  const t = useTranslations(TranslationKeys.ABOUT);

  const handleSMSClick = () => {
    router.push("/contact-us");
  };

  const handleAboutUs = () => {
    router.push("/about-us");
  };

  const handleMediaGallery = () => {
    router.push("/gallery");
  };
  return (
    <div className="mt-10">
      <footer className="relative">
        <div
          style={{
            backgroundImage: `url(${footerMask.src || footerMask})`,
            backgroundColor: "#026419",
          }}
        >
          <div className="w-[100%] sm:max-w-[40rem] md:max-w-[48rem] lg:max-w-[64rem] xl:max-w-[80rem] mx-auto  pt-12 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center mr-[100px]">
              <div className="flex flex-col items-start">
                <Image src={UrduIdreesiaLogo} alt="Logo" />
              </div>

              {/* Contact Section */}
              <div className="flex flex-col items-start gap-1 sm:gap-3">
                <h3 className="text-white text-xl font-semibold mb-[10px]">
                  {t(TranslationKeys.CONTACT_TITLE)}
                </h3>

                <a
                  href="https://wa.me/061111111381"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline"
                >
                  061-111-111-381
                </a>

                <a
                  href="https://maps.app.goo.gl/r6n2rURPfiMkmoUC9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white"
                >
                  <p
                    className=" text-white text-left"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {t(TranslationKeys.ADDRESS)}
                  </p>
                </a>
              </div>

              {/* About Section */}
              <div className="flex flex-col items-start gap-1 sm:gap-3">
                <h3 className="text-white text-xl  font-semibold mb-[10px]">
                  {t(TranslationKeys.TITLE)}
                </h3>

                <h3
                  className="text-white text-left  cursor-pointer"
                  onClick={handleSMSClick}
                >
                  {/* {t(TranslationKeys.SILSILA_NAME)} */}
                  About
                </h3>
                {/* <p
                  className=" text-white cursor-pointer"
                  onClick={handleAboutUs}
                >
                  {t(TranslationKeys.SMS)}
                </p> */}
                <p
                  className=" text-white cursor-pointer"
                  onClick={handleMediaGallery}
                >
                  Media Gallery
                </p>
                <h1 className="text-white font-weight-300">Social Media</h1>

                <ul className="inline-flex  gap-2">
                  <li>
                    <Image src={whatsapp} alt="whatsapp" />
                  </li>
                  <li>
                    <Image src={playStore} alt="playstore" />
                  </li>
                  <li>
                    <Image src={appStore} alt="app store" />
                  </li>
                  <li>
                    <Image src={YouTube} alt="YouTube" />
                  </li>
                </ul>
              </div>
              <div className="absolute top-0 right-0 h-full w-[350px] pointer-events-none">
                <Image src={footerlogo} alt="App Store" fill />
              </div>
            </div>
            <div className="absolute bottom-12">
              <Image src={line} alt="App Store" className="object-contain" />
            </div>

            <div className="mt-16 pl-2">
              {/* mt-16 pushes it down a bit from the line */}
              <p className="text-white text-left">
                {t(TranslationKeys.COPYRIGHT)}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

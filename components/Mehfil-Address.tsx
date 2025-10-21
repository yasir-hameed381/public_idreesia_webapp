"use client";
import { TranslationKeys } from "@/app/constants/translationKeys";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Translation } from "react-i18next";
import mehfileImage from "../app/assets/mehfile.png";

export default function MehfilAddressCard() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations(TranslationKeys.MEHFIL_DIRECTORY);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // console.log("visible", isVisible);
    setIsVisible(true);
  }, []);
  // If not visible, return null
  if (!isVisible) {
    return null;
  }
  const handleSubmitInitial = () => {
    router.push("/mehfil-diractroy");
  };

  return (
    // <div className="   md:w-[746px] sm:w-[500px] w-[300px] sm: mx-auto bg-[#FCF8F5] p-6 rounded-lg shadow-sm mb-12">
    //   <div className="flex flex-col items-center">
    //     {/* Close Button */}
    //     <div className="self-end mb-2">
    //       <button
    //         onClick={handleClose}
    //         className="text-gray-400 hover:text-gray-600"
    //       >
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           width="24"
    //           height="24"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           stroke="currentColor"
    //           strokeWidth="2"
    //           strokeLinecap="round"
    //           strokeLinejoin="round"
    //         >
    //           <line x1="18" y1="6" x2="6" y2="18"></line>
    //           <line x1="6" y1="6" x2="18" y2="18"></line>
    //         </svg>
    //       </button>
    //     </div>

    //     {/* Location Icon Circle */}
    //     <div className="bg-white rounded-full p-4 shadow-md mb-6">
    //       <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 24 24"
    //           fill="currentColor"
    //           className="w-10 h-10 text-green-600"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </div>
    //     </div>

    //     {/* Title */}
    //     <h1 className="text-2xl font-bold text-gray-800 mb-2">
    //       {t("mehfilAddress")}
    //     </h1>

    //     {/* Description */}
    //     <p className="text-gray-600 text-center mb-6">{t("description")}</p>

    //     {/* Button */}
    //     <button
    //       onClick={handleSubmitInitial}
    //       className="bg-[#028F4F] hover:bg-green-500 text-white  text-sm font-medium py-3 px-3 rounded-lg transition duration-300"
    //     >
    //       {t("buttonText")}
    //     </button>
    //   </div>
    // </div>
    <div className="w-full mt-[100px]">
      <div className="flex w-full">
        <div className="w-1/2 flex flex-col justify-center items-start px-8">
          <div className="flex flex-col items-center">
            <h1
              className="text-center mb-8"
              style={{
                color: "#026419",
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "34px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Mahafil Address Directory
            </h1>
            <p className="text-xl">
              Explore the official directory of all Mahafil. Find address,
              contact information, and timings for Mahafil in your city and
              country.
            </p>
            <div className="w-full flex justify-start">
              <button
                className={`mt-10 text-white rounded-full px-10 py-2 whitespace-nowrap text-center`}
                aria-label={"test"}
                onClick={handleSubmitInitial}
                style={{
                  backgroundColor: "#026419",
                  fontWeight: 300,
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                }}
              >
                Connect With Your Mehfils
              </button>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <Image src={mehfileImage} alt="image" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  );
}

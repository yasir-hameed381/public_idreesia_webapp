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
    router.push("/mehfil-directory");
  };

  return (
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

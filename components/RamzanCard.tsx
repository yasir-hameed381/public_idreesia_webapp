"use client";

import { X } from "lucide-react";
import Image from "next/image";
import reading from "../app/assets/reading.png";
import maskImage from "../app/assets/Mask.png";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { activeParhaiyan } from "../services/Active-parhaiyan";
import { useLocale } from "next-intl";

export default function RamzanCard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [activeData, setActiveData] = useState<any>(null);
  const [error, setError] = useState("");
  const locale = useLocale();

  // Corrected translation function
  const getLocalizedText = (enText?: string, urText?: string) =>
    locale === "ur" ? urText || enText : enText || urText;

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    console.log("Active data:", activeData);
    if (activeData?.[0]?.url_slug) {
      console.log("Navigating to:", `/parhaiyan/${activeData[0].url_slug}`);
    }
  }, [activeData]);

  useEffect(() => {
    setIsVisible(true);
    const fetchData = async () => {
      try {
        const data = await activeParhaiyan();
        console.log("active-parhaiyan-data", data);
        setActiveData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  if (!isVisible) return null;

  const handleSubmitInitial = () => {
    if (activeData?.[0]?.url_slug) {
      sessionStorage.setItem(
        "currentParhaiyanData",
        JSON.stringify(activeData[0])
      );
      router.push(`/parhaiyan/${activeData[0].url_slug}`);
    }
  };

  return (
    activeData?.[0]?.is_active && (
      <div className="w-full">
        <div
          className="relative p-8 rounded-lg shadow-md text-center w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${maskImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="flex justify-center mb-4">
            <Image src={reading} alt="Book Icon" width={80} height={80} />
          </div>

          <h2 className="text-xl font-bold mb-4 text-white">
            {getLocalizedText(activeData[0].title_en, activeData[0].title_ur)}
          </h2>
          <p className="mb-4 text-white">
            {getLocalizedText(
              activeData[0].description_en,
              activeData[0].description_ur
            )}
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmitInitial}
            className="bg-white text-sm px-4 py-3 font-semibold rounded-lg hover:bg-gray-100 transition"
            style={{ color: "#026419" }}
          >
            {locale === "ur" ? "پڑھائی جمع کروائیں" : "Submit Parhaiyan"}
          </button>
        </div>
      </div>
    )
  );
}

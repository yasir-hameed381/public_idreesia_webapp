import React, { useEffect } from "react";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  const { locale } = router;

  const searchDetails = useSelector((state: any) => state?.search.searchDetails);

  const title = searchDetails;

  const getTitle = (title: any) => {
    return locale === "ur" ? title.title_ur : title.title_en;
  };
  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-black">
          All Search Details
        </h1>
        {searchDetails?.id && (
          <p className="text-black">
            <strong>ID:</strong> {searchDetails.id}
          </p>
        )}

        <p
          className={`text-2xl text-black font-bold mb-4 ${
            locale === "ur" ? "font-urdu text-right" : ""
          }`}
        >
          {getTitle(title)}
        </p>

        {searchDetails?.track && (
          <p className="text-black">
            <strong>Track:</strong> {searchDetails.track}
          </p>
        )}
        {searchDetails?.filepath && (
          <div className="mb-4">
            <audio
              controls
              src={searchDetails.filepath}
              className="mt-2 w-full"
            ></audio>
          </div>
        )}
      </div>
    </div>
  );
};


export default Index;

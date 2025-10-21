"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

interface SearchAudioData {
  filepath: string;
  id: number;
  title_en: string;
  title_ur: string;
  track: string;
}

const page = () => {
  const router = useRouter();
  const { locale }: any = router;

  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const searchDetails: SearchAudioData = useSelector(
    (state: any) => state?.search.searchDetails
  );

  useEffect(() => {
    const audio: any = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleSeeking = () => {
      setIsLoading(true);
    };

    const handleSeeked = () => {
      // Check if audio is ready after seeking
      if (audio.readyState >= 4) {
        setIsLoading(false);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsLoading(false);
    };

    const handlePause = () => {
      // Only show loading if audio is buffering (readyState < 4)
      if (audio.readyState < 4) {
        setIsLoading(true);
      }
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("seeking", handleSeeking);
      audio.removeEventListener("seeked", handleSeeked);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const title = searchDetails;

  const getTitle = (title: any) => {
    return locale === "ur" ? title.title_ur : title.title_en;
  };

  return (
    <div className="bg-[#fcf8f5] dark:bg-zinc-800 py-12">
      <div className="w-full mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-green-600 hover:text-primary-700"
            >
              <svg
                className="shrink-0 [:where(&amp;)]:size-6 size-4"
                data-flux-icon=""
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                ></path>
              </svg>
              Back
            </button>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700">
            <h1
              className={`text-2xl font-semibold mb-4 dark:text-white ${
                locale === "ur" ? "font-urdu text-right" : ""
              }`}
            >
              {getTitle(title)}
            </h1>

            {searchDetails?.track && (
              <p className="text-black">
                <strong>Track:</strong> {searchDetails.track}
              </p>
            )}
            {searchDetails?.filepath && (
              <div className="mb-4 relative">
                <audio
                  ref={audioRef}
                  controls
                  src={searchDetails.filepath}
                  className="mt-2 w-full"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none rounded">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
            )}
            <div
              className={`prose dark:prose-invert mb-4 break-words ${
                locale === "ur" ? "font-urdu text-right" : ""
              }`}
            >
              <p>{getTitle(title)}</p>
            </div>
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-4">
              <a
                href={searchDetails.filepath}
                download=""
                className="inline-flex items-center gap-2 text-white bg-green-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                <svg
                  className="shrink-0 [:where(&amp;)]:size-6 size-4"
                  data-flux-icon=""
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  ></path>
                </svg>
                Download Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

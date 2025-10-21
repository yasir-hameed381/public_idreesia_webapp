"use client";
import { useGetMessagesQuery } from "@/store/slicers/messagesApi";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import image from "../../app/assets/image.png";
import image2 from "../../app/assets/image2.png";
import LoadingSpinner from "../ui/Loadingspinner";

export default function LatestMessage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const itemsPerPage = 150;
  const { data, isLoading, error, isFetching } = useGetMessagesQuery({
    page: 15,
    size: itemsPerPage,
    search: "",
  });
  const latestMessage = data?.data?.slice(-2) ?? [];

  const getLocalizedContent = (item: any) => ({
    title: locale === "ur" ? item.title_ur : item.title_en,
  });

  if (isLoading || isFetching) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-5 text-center text-red-500">Error loading messages</div>
    );
  }

  return (
    <div className="w-full mt-[100px]">
      {/* Heading */}
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
        Latest Messages
      </h1>

      <div className="flex w-full">
        <div className="w-1/2 flex justify-center items-center">
          <Image src={image} alt="image" className="max-w-full h-auto" />
        </div>

        <div className="w-1/2 flex flex-col justify-center items-start px-8">
          <Image src={image2} alt="second image" />

          <div className="flex flex-col items-center">
            {latestMessage.map((item) => {
              const localizedContent = getLocalizedContent(item);
              return (
                <div
                  key={item.id}
                  className=" w-full p-2  mb-5  border-b border-gray-300"
                >
                  <h2
                    className={`text-xl font-bold text-[#026419] ${
                      locale === "ur" ? "font-urdu text-right" : ""
                    }`}
                  >
                    {localizedContent.title}
                  </h2>
                  <p
                    className={`mt-4 text-base text-[#026419] ${
                      locale === "ur" ? "font-urdu text-right" : ""
                    }`}
                  >
                    {item.created_at}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex align-center justify-center">
        <Link href={"/latestmessages"} passHref>
          <button
            className={`mt-5 text-white rounded-full px-10 py-2 whitespace-nowrap text-center`}
            aria-label={"test"}
            style={{
              backgroundColor: "#026419",
              fontWeight: 300,
              fontSize: "18px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            Check Latest News
          </button>
        </Link>
      </div>
    </div>
  );
}

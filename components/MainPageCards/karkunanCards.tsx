"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface KarkunanCardProps {
  title: string;
  buttonText: string;
  href: string;
  borderColor: string;
}

const KarkunanCard: React.FC<KarkunanCardProps> = ({
  title,
  buttonText,
  href,
  borderColor,
}) => {
  const router = useRouter();

  const handleNavigation = () => {
    router.push(href);
  };

  return (
    <div
      onClick={handleNavigation}
      className={`flex w-full sm:w-auto sm:min-w-[200px] flex-col items-center justify-center border rounded-xl p-4 shadow bg-white hover:shadow-lg transition cursor-pointer group ${borderColor}`}
    >
      <span className="text-lg font-semibold text-center text-[#424242] mb-4">
        {title}
      </span>
      <button className="px-6 py-3 border-[#e3e3e3] bg-white group-hover:text-white group-hover:bg-[#028f4f] border-[1px] rounded-2xl text-[#424242] font-semibold hover:opacity-90 transition w-full">
        {buttonText}
      </button>
    </div>
  );
};

export default KarkunanCard;

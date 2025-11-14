"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationCardProps {
  href: string;
  label: string;
  icon: string;
}

export const KarkunNavigation = () => {
  const pathname = usePathname();

  const navigationCards: NavigationCardProps[] = [
    {
      href: "/karkun-portal/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      href: "/karkun-portal/karkunan",
      label: "Karkunan",
      icon: "👥",
    },
    {
      href: "/karkun-portal/mehfil-reports",
      label: "Reports",
      icon: "📋",
    },
    {
      href: "/karkun-portal/new-ehad",
      label: "New Ehad",
      icon: "✨",
    },
    {
      href: "/karkun-portal/tabarukats",
      label: "Tabarukat",
      icon: "💰",
    },
    {
      href: "/karkun-portal/dutyRoster",
      label: "Duty Roster",
      icon: "📅",
    },
    {
      href: "/karkun-portal/khatoot",
      label: "Khatoot",
      icon: "📜",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {navigationCards.map((card) => {
        const isActive = pathname?.includes(card.href.split("/").pop() || "");

        return (
          <Link
            key={card.href}
            href={card.href}
            className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              isActive
                ? "bg-gradient-to-br from-green-600 to-green-700 text-white"
                : "bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white"
            }`}
          >
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">{card.icon}</div>
              <div
                className={`font-semibold ${
                  isActive
                    ? "text-white"
                    : "text-gray-700 group-hover:text-green-700"
                }`}
              >
                {card.label}
              </div>
            </div>
            {/* Decorative Corner */}
            <div
              className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 ${
                isActive ? "bg-white/10" : "bg-green-100"
              } rounded-full`}
            ></div>
          </Link>
        );
      })}
    </div>
  );
};



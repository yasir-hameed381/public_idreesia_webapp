"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { HiLocationMarker } from "react-icons/hi";
import headerImage from "@/app/assets/Karkun-header-img.png";
import { t } from "i18next";
import MobileAppShowcase from "@/components/MainPageCards/MobileAppShowCase";
import LatestMessage from "@/components/MainPageCards/LatestMessage";
import MehfilAddressCard from "@/components/Mehfil-Address";
import centerImage from "../../../assets/centered-border.png";
import Footer from "@/components/Footer";

export default function KarkunPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const { user, logout } = useAuth();
  const { hasPermission, isZoneAdmin, isMehfilAdmin, isSuperAdmin } =
    usePermissions();
  const pathname = usePathname();

  const menuToggler = () => setIsVisible((prevState) => !prevState);

  const handleLogout = () => {
    logout();
  };

  // Navigation tabs with permissions
  const navigationTabs = [
    {
      href: "/karkun-portal/dashboard",
      label: "Dashboard",
      permission: PERMISSIONS.VIEW_DASHBOARD,
      showToAll: true, // Dashboard should be visible to all logged in users
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/karkunan",
      label: "Karkunan",
      permission: PERMISSIONS.VIEW_KARKUNAN,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/mehfil-reports",
      label: "Reports",
      permission: PERMISSIONS.VIEW_MEHFIL_REPORTS,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/new-ehad",
      label: "New Ehad",
      permission: PERMISSIONS.VIEW_NEW_EHADS,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/attendance",
      label: "Duty Roster",
      permission: PERMISSIONS.VIEW_DUTY_ROSTER,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/tabarukats",
      label: "Tabarukat",
      permission: PERMISSIONS.VIEW_TABARUKATS,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
            clipRule="evenodd"
          />
          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
        </svg>
      ),
    },
  ];

  // Filter tabs based on permissions
  const visibleTabs = navigationTabs.filter((tab) => {
    // Show tab if it's marked as showToAll or user has permission
    if (tab.showToAll) return true;
    return hasPermission(tab.permission);
  });

  const isActiveTab = (href: string) => {
    if (href === "/karkun-portal/dashboard") {
      return pathname === href || pathname === "/karkun-portal";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Islamic Header Image */}
      <header className="relative">
        <div className="relative w-full h-60 md:h-30">
          <Image
            src={headerImage}
            alt="Karkun Portal Header"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

          {/* User Info Overlay - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <div className="relative">
              <button
                onClick={menuToggler}
                className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg border border-green-200"
              >
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"}
                </div>
                <span className="hidden md:block font-medium text-gray-800">
                  {user?.name || "User"}
                </span>
                <IoIosArrowDown
                  className={`text-gray-600 transition-transform ${
                    isVisible ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isVisible && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-800">
                      {user?.name || "User"}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {isSuperAdmin && (
                        <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Super Admin
                        </span>
                      )}
                      {isZoneAdmin && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Zone Admin
                        </span>
                      )}
                      {isMehfilAdmin && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Mehfil Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Zone Information - Show if user has zone access */}
                  {user?.zone &&
                    (isZoneAdmin ||
                      isMehfilAdmin ||
                      hasPermission(PERMISSIONS.VIEW_ZONES)) && (
                      <div className="px-4 py-3 border-b border-gray-200 bg-green-50">
                        <div className="flex items-start gap-2">
                          <HiLocationMarker className="text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-600 mb-1">
                              Zone
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {user.zone.title_en}
                            </div>
                            {user.zone.city_en && (
                              <div className="text-xs text-gray-600 mt-1">
                                {user.zone.city_en}
                                {user.zone.country_en &&
                                  `, ${user.zone.country_en}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    onClick={() => setIsVisible(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
                  >
                    <FiUser className="text-lg" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setIsVisible(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>Home</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsVisible(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="text-lg" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-start space-x-1 overflow-x-auto">
              {visibleTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    isActiveTab(tab.href)
                      ? "border-green-600 text-green-700 bg-green-50"
                      : "border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      {/* <footer className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Idreesia Karkun Portal. All rights
              reserved.
            </p>
            <p className="text-xs mt-2 text-green-100">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
}

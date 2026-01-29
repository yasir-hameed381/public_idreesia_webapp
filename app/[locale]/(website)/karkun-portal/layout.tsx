"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { FaUserCircle } from "react-icons/fa";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { HiLocationMarker } from "react-icons/hi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import headerImage from "@/app/assets/banner-slides/002.webp";
import { t } from "i18next";
import image1 from "@/app/assets/banner-slides/002.webp";
import image2 from "@/app/assets/banner-slides/003.webp";
import image3 from "@/app/assets/banner-slides/004.webp";
import image4 from "@/app/assets/banner-slides/005.webp";
import image5 from "@/app/assets/banner-slides/006.webp";
import Footer from "@/components/Footer";

// Banner slide images
const bannerSlides = [image1, image2, image3, image4, image5];

export default function KarkunPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { user, logout } = useAuth();
  const { isZoneAdmin, isMehfilAdmin, isSuperAdmin, isRegionAdmin, isAllRegionAdmin } =
    usePermissions();
  const router = useRouter();

  const pathname = usePathname();

  // Check access to karkun portal (matching Laravel KarkunMiddleware)
  // Users can access if they are: isMehfilAdmin OR isZoneAdmin OR isRegionAdmin OR isAllRegionAdmin
  React.useEffect(() => {
    if (!user) {
      // User not logged in, redirect to login
      const locale = pathname.split('/')[1] || 'en';
      router.push(`/${locale}/login`);
      return;
    }

    const hasAccess = isMehfilAdmin || isZoneAdmin || isRegionAdmin || isAllRegionAdmin;
    
    if (!hasAccess) {
      // User doesn't have required admin flags, redirect to home or show access denied
      const locale = pathname.split('/')[1] || 'en';
      router.push(`/${locale}`);
    }
  }, [user, isMehfilAdmin, isZoneAdmin, isRegionAdmin, isAllRegionAdmin, pathname, router]);

  // If user doesn't have access, show access denied message
  const hasAccess = isMehfilAdmin || isZoneAdmin || isRegionAdmin || isAllRegionAdmin;
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this area.
          </p>
          <button
            onClick={() => {
              const locale = pathname.split('/')[1] || 'en';
              router.push(`/${locale}`);
            }}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const menuToggler = () => setIsVisible((prevState) => !prevState);

  const handleLogout = () => {
    logout();
  };

  // Navigation tabs - same for all users (matching Laravel implementation)
  const navigationTabs = [
    {
      href: "/karkun-portal/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/karkunan",
      label: "Karkunan",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/mehfil-reports",
      label: "Reports",
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
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
    {
      href: "/karkun-portal/tabarukats",
      label: "Tabarukat",
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
    {
      href: "/karkun-portal/dutyRoster",
      label: "Duty Roster",
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
  ];

  // Add Tarteeb tab conditionally based on region_id (matching Laravel implementation)
  // Allowed region IDs: [1, 6] (from Laravel config)
  const allowedRegionIds = [1, 6];
  const userRegionId = (user as any)?.region_id || (user as any)?.zone?.region_id;
  
  if (userRegionId && allowedRegionIds.includes(userRegionId)) {
    navigationTabs.push({
      href: "/karkun-portal/tarteeb-requests",
      label: "Tarteeb",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    });
  }

  // Show all tabs to all users (no permission filtering)
  const visibleTabs = navigationTabs;

  const isActiveTab = (href: string) => {
    if (!pathname) return false;

    // Remove locale from pathname if present (e.g., /en/karkun-portal -> /karkun-portal)
    // Locale is typically 2 letters: en, ur, ar, etc.
    let normalizedPathname = pathname.toLowerCase();
    const localeMatch = normalizedPathname.match(/^\/[a-z]{2}(\/|$)/);
    if (localeMatch) {
      normalizedPathname = normalizedPathname.substring(3); // Remove /en, /ur, etc.
    }

    // Ensure pathname starts with /
    if (!normalizedPathname.startsWith("/")) {
      normalizedPathname = "/" + normalizedPathname;
    }

    const normalizedHref = href.toLowerCase();

    // Debug logging
    console.log("🔍 Active Tab Check:", {
      originalPathname: pathname,
      normalizedPathname,
      href: normalizedHref,
      locale: localeMatch?.[0],
    });

    // Special case for dashboard - exact match or root karkun-portal path
    if (normalizedHref === "/karkun-portal/dashboard") {
      const isActive =
        normalizedPathname === normalizedHref ||
        normalizedPathname === "/karkun-portal" ||
        normalizedPathname === "/karkun-portal/";
      console.log("✅ Dashboard active?", isActive);
      return isActive;
    }

    // For other routes, check if pathname starts with href
    // This will match /karkun-portal/dutyRoster, /karkun-portal/dutyRoster/new, /karkun-portal/dutyRoster/123
    const isActive = normalizedPathname.startsWith(normalizedHref);
    console.log(`✅ ${href} active?`, isActive);
    return isActive;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Islamic Header Banner Slider */}
      <header className="relative">
        <div className="relative w-full h-60 md:h-65 overflow-hidden">
          {/* Slider Images */}
          {bannerSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide}
                alt={`Banner Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* LEFT: Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {visibleTabs.map((tab) => {
                  const isActive = isActiveTab(tab.href);
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 relative ${
                        isActive
                          ? "border-green-600 text-green-700 bg-green-50 font-bold"
                          : "border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={
                          isActive ? "text-green-700" : "text-gray-500"
                        }
                      >
                        {tab.icon}
                      </div>
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* RIGHT: User Info */}
              <div className="relative">
                {/* User button */}
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="flex items-center gap-2 focus:outline-none text-gray-700 hover:text-green-700"
                >
                  <img
                    src="/default-avatar.png"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-gray-300"
                  />
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.name || "User"}
                  </span>

                  {/* ▼ Arrow Down */}
                  <FiChevronDown
                    className={`text-gray-500 transition-transform duration-200 ${
                      isVisible ? "rotate-0 text-green-600" : "-rotate-90"
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {isVisible && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="font-semibold text-gray-800">
                        {user?.name || "User"}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      {/* <div className="flex flex-wrap gap-1 mt-2">
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
                      </div> */}
                    </div>

                  {/* Zone Information - Show if user has zone */}
                  {user?.zone && (
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
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

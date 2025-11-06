"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import headerImage from "../app/assets/header-image.png";
import { TranslationKeys } from "../app/constants/translationKeys";
import ToggleMenuIcon from "../app/assets/svg/toggleMenuIcon";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { useAuth } from "@/hooks/useAuth";
import NavigationLink from "./NavigationLink";

const LANG_DROPDOWN = [
  { id: 1, value: "en", label: "English" },
  { id: 2, value: "ur", label: "اردو" },
];

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations(TranslationKeys.NOTIFICATIONS);
  const { isAuthenticated, user, logout } = useAuth();

  console.log("isauthenticted", isAuthenticated);
  console.log("user==========", user);

  const menuToggler = () => setIsVisible((prevState) => !prevState);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prevState) => !prevState);

  const onLanguageChange = (e) => {
    const newLocale = e.target.value;
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");
    router.push(`/${newLocale}${pathnameWithoutLocale}`);
  };

  const handleLogout = () => {
    logout();
  };

  // Check if current path is karkun portal
  const isKarkunPortal = pathname.includes("karkun-portal");

  // Close mobile menu on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".user-dropdown") &&
        !target.closest(".mobile-menu")
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible]);

  return (
    <header className="text-white relative">
      <div className="mx-auto">
        <div className="flex flex-col justify-between">
          <NavigationLink href="/" className="shrink-0 cursor-pointer">
            <Image
              src={headerImage}
              alt="Header Image"
              layout="responsive"
              width={1600}
              height={50}
              priority
              className="w-full h-auto"
            />
          </NavigationLink>

          {/* Desktop Navigation Bar */}
          <div className="flex justify-between items-center px-4 py-2 bg-green-700">
            {/* Language Selector */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <select
                value={locale}
                onChange={onLanguageChange}
                className="bg-white text-black px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {LANG_DROPDOWN.map((lang) => (
                  <option key={lang.id} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <div className="relative">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative user-dropdown">
                      <button
                        onClick={menuToggler}
                        className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                      >
                        <FaUserCircle className="text-xl" />
                        <span className="hidden lg:block">
                          {user?.name || "User"}
                        </span>
                        <IoIosArrowDown
                          className={`transition-transform ${
                            isVisible ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn">
                          {/* User Info */}
                          <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            <div className="font-medium">
                              {user?.name || "User"}
                            </div>
                            <div className="text-gray-500">{user?.email}</div>
                          </div>

                          {/* Profile */}
                          <NavigationLink
                            href="/profile"
                            onClick={() => setIsVisible(false)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FiUser />
                            <span>Profile</span>
                          </NavigationLink>

                          {/* Conditionally Show Home OR Karkun Portal */}
                          {/* Matching Laravel KarkunMiddleware: isMehfilAdmin || isZoneAdmin || isRegionAdmin || isAllRegionAdmin */}
                          {(user?.is_mehfil_admin ||
                            user?.is_zone_admin ||
                            user?.is_region_admin ||
                            user?.is_all_region_admin) &&
                            (isKarkunPortal ? (
                              <NavigationLink
                                href="/"
                                onClick={() => setIsVisible(false)}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaUserCircle />
                                <span>Home</span>
                              </NavigationLink>
                            ) : (
                              <NavigationLink
                                href="/karkun-portal"
                                onClick={() => setIsVisible(false)}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaUserCircle />
                                <span>Karkun Portal</span>
                              </NavigationLink>
                            ))}

                          {/* Logout */}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsVisible(false);
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FiLogOut />
                            <span>Log Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <NavigationLink
                    href="/login"
                    className="flex items-center gap-2 text-black bg-white rounded-sm p-2 font-bold"
                  >
                    Login
                  </NavigationLink>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center p-2 text-white hover:bg-green-600 rounded transition-colors"
              aria-label="Toggle mobile menu"
            >
              <ToggleMenuIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-green-600 px-4 py-3 space-y-3 mobile-menu animate-slideDown">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-2 pb-3 border-b border-green-500">
                    <FaUserCircle className="text-2xl" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-200">{user?.email}</div>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <NavigationLink
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white hover:bg-green-700 rounded transition-colors"
                  >
                    <FiUser className="text-lg" />
                    <span>Profile</span>
                  </NavigationLink>

                  {/* Conditionally Show Home OR Karkun Portal */}
                  {/* Matching Laravel KarkunMiddleware: isMehfilAdmin || isZoneAdmin || isRegionAdmin || isAllRegionAdmin */}
                  {(user?.is_mehfil_admin ||
                    user?.is_zone_admin ||
                    user?.is_region_admin ||
                    user?.is_all_region_admin) &&
                    (isKarkunPortal ? (
                      <NavigationLink
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white hover:bg-green-700 rounded transition-colors"
                      >
                        <FaUserCircle className="text-lg" />
                        <span>Home</span>
                      </NavigationLink>
                    ) : (
                      <NavigationLink
                        href="/karkun-portal"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white hover:bg-green-700 rounded transition-colors"
                      >
                        <FaUserCircle className="text-lg" />
                        <span>Karkun Portal</span>
                      </NavigationLink>
                    ))}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-white hover:bg-green-700 rounded transition-colors"
                  >
                    <FiLogOut className="text-lg" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <NavigationLink
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-black bg-white rounded p-2 font-bold hover:bg-gray-100 transition-colors"
                >
                  Login
                </NavigationLink>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

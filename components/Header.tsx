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
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations(TranslationKeys.NOTIFICATIONS);
  const { isAuthenticated, user, logout } = useAuth();

  console.log("isauthenticted", isAuthenticated);
  console.log("user==========", user);

  const menuToggler = () => setIsVisible((prevState) => !prevState);

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

  return (
    <header className="text-white relative">
      <div className="mx-auto">
        <div className="flex flex-col justify-between">
          <NavigationLink href="/" className="flex-shrink-0 cursor-pointer">
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

          <div className="flex justify-between items-center px-4 py-2 bg-green-700">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Language:</span>
                <select
                  value={locale}
                  onChange={onLanguageChange}
                  className="bg-white text-black px-2 py-1 rounded text-sm"
                >
                  {LANG_DROPDOWN.map((lang) => (
                    <option key={lang.id} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <div className="relative">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={menuToggler}
                        className="flex items-center space-x-2 text-white hover:text-gray-200"
                      >
                        <FaUserCircle className="text-xl" />
                        <span className="hidden md:block">
                          {user?.name || "User"}
                        </span>
                        <IoIosArrowDown
                          className={`transition-transform ${
                            isVisible ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                          {(user?.is_mehfil_admin ||
                            user?.is_zone_admin ||
                            user?.is_super_admin) &&
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

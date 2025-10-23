"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { TranslationKeys } from "../app/constants/translationKeys";
import NavigationLink from "./NavigationLink";

enum NavigationKeys {
  newMessages = "newMessages",
  mehfils = "mehfils",
  taleemat = "taleemat",
  naatShareef = "naatShareef",
  wazaif = "wazaif",
  gallery = "gallery",
  ramzanParhaiyan = "ramzanParhaiyan",
  mehfilAddress = "mehfilAddress",
}
interface NavItem {
  key: NavigationKeys;
  href: string;
  borderColor: string;
  hoverColor: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  {
    key: NavigationKeys.newMessages,
    href: "/latestmessages",
    borderColor: "border-purple-600",
    hoverColor: "hover:text-purple-600",
    activeColor: "bg-green-700 text-white",
  },
  {
    key: NavigationKeys.mehfils,
    href: "/mehfils",
    borderColor: "border-green-700",
    hoverColor: "hover:text-green-700",
    activeColor: "bg-green-700 text-white",
  },
  {
    key: NavigationKeys.taleemat,
    href: "/taleemat",
    borderColor: "border-blue-900",
    hoverColor: "hover:text-blue-900",
    activeColor: "bg-green-700 text-white",
  },
  {
    key: NavigationKeys.naatShareef,
    href: "/naatsharif",
    borderColor: "border-yellow-400",
    hoverColor: "hover:text-yellow-400",
    activeColor: "bg-green-700 text-white",
  },
  {
    key: NavigationKeys.wazaif,
    href: "/wazaif",
    borderColor: "border-orange-500",
    hoverColor: "hover:text-orange-500",
    activeColor: "bg-green-700 text-white",
  },
  {
    key: NavigationKeys.mehfilAddress,
    href: "/mehfil-diractroy",
    borderColor: "border-pink-500",
    hoverColor: "hover:text-pink-500",
    activeColor: "bg-green-700 text-white",
  },
];

export default function Navigation() {
  const t = useTranslations(TranslationKeys.NAV);
  const pathname = usePathname();

  // Check if the current path matches the navigation item
  const isActive = (href: string) => {
    // Remove locale from pathname for comparison
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const hrefWithoutSlash = href.startsWith("/") ? href.slice(1) : href;
    return pathWithoutLocale.startsWith(hrefWithoutSlash);
  };

  return (
    <nav
      className="flex justify-center items-center my-8"
      aria-label="Main Navigation"
    >
      <ul className="flex flex-wrap justify-center items-center gap-8 list-none p-0 m-0">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.key} className="nav-item">
              <NavigationLink href={item.href}>
                <button
                  className={`block w-40 h-9 rounded-full px-4 py-1 whitespace-nowrap text-center border transition-all ${
                    active
                      ? `${item.activeColor} ${item.borderColor}`
                      : `text-gray-700 ${item.borderColor} ${item.hoverColor}`
                  }`}
                  aria-label={t(`navigation.${item.key}`)}
                >
                  {t(`navigation.${item.key}`)}
                </button>
              </NavigationLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

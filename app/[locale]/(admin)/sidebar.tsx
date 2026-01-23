"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Layout, Menu, theme, Button } from "antd";
import {
  DashboardOutlined,
  FolderOutlined,
  TagsOutlined,
  SoundOutlined,
  BookOutlined,
  VideoCameraOutlined,
  BookFilled,
  UploadOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ClockCircleFilled,
  ReadOutlined,
} from "@ant-design/icons";
import IdreesiaLogo from "../../../app/assets/urdu-idreesia-logo.png";
import {
  User,
  Headphones,
  MapPinned,
  Contact,
  FileText,
  Users,
  MessageSquare,
  MessageCircle,
  Package,
  Calendar,
  ClipboardList,
  UserCog,
  Globe,
  Building,
  Shield,
  List,
  UserPlus,
  Home,
  LogOut,
  Files,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS, PermissionName } from "@/types/permission";
import NavigationLink from "@/components/NavigationLink";
import NProgress from "nprogress";
import { useTheme } from "@/context/useTheme";

const { Sider } = Layout;

// Prop types for the sidebar
interface AppSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  toggleSidebar?: () => void;
}

export function AppSidebar({
  collapsed: externalCollapsed,
  onCollapse: externalOnCollapse,
  toggleSidebar,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Use external collapsed state if provided, otherwise use internal state
  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : collapsed;
  const onCollapse = externalOnCollapse || setCollapsed;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setShowUserMenu(false);
        }
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Clean the pathname to match the navigation items
  const cleanedPathname = pathname.replace(/^\/[a-z]{2}\//, "");
  const locale = pathname.split('/')[1] || 'en';

  // Define navigation structure matching Laravel's sidebar layout
  // Only including items that exist in React
  interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    permission: PermissionName | null;
  }

  interface NavGroup {
    heading: string;
    items: NavItem[];
  }

  // Home/Admin (standalone, not in a group)
  const homeItem: NavItem = {
    name: "Home",
    href: "/admin",
    icon: <Home size={18} />,
    permission: PERMISSIONS.VIEW_DASHBOARD,
  };

  // MCC Group (matching Laravel structure)
  const mccGroup: NavGroup = {
    heading: "MCC",
    items: [
      {
        name: "Regions",
        href: "/regions",
        icon: <Globe size={18} />,
        permission: PERMISSIONS.VIEW_REGIONS,
      },
      {
        name: "Zones",
        href: "/zone",
        icon: <MapPinned size={18} />,
        permission: PERMISSIONS.VIEW_ZONES,
      },
      {
        name: "Mehfil Directory",
        href: "/mehfildirectary",
        icon: <Building size={18} />,
        permission: PERMISSIONS.VIEW_MEHFIL_DIRECTORY,
      },
      {
        name: "Ehad Karkuns Directory",
        href: "/ehadKarkun",
        icon: <List size={18} />,
        permission: PERMISSIONS.VIEW_EHAD_KARKUN,
      },
      {
        name: "Karkuns",
        href: "/karkunan",
        icon: <Users size={18} />,
        permission: PERMISSIONS.VIEW_KARKUNS,
      },
      {
        name: "Mehfil Reports",
        href: "/mehfil-reports",
        icon: <FileText size={18} />,
        permission: PERMISSIONS.VIEW_MEHFIL_REPORTS,
      },
      {
        name: "Tabarukats",
        href: "/tabarukats",
        icon: <Package size={18} />,
        permission: PERMISSIONS.VIEW_TABARUKATS,
      },
      {
        name: "New Ehads",
        href: "/new-ehads",
        icon: <UserPlus size={18} />,
        permission: PERMISSIONS.VIEW_NEW_EHADS,
      },      
    ],
  };
  const Group803: NavGroup = {
    heading: "803",
    items: [
      {
        name: "Tarteeb Requests",
        href: "/tarteeb-requests",
        icon: <ClipboardList size={18} />,
        permission: PERMISSIONS.VIEW_TARTEEB_REQUESTS,
      },
      {
        name: "Khatoot / Masail",
        href: "/khatoot",
        icon: <BookOutlined />,
        permission: PERMISSIONS.VIEW_KHATOOT,
      },
      {
        name: "Response Templates",
        href: "/response-templates",
        icon: <Files size={18} />,
        permission: PERMISSIONS.VIEW_RESPONSE_TEMPLATES,
      },
    ],
  };
  // CMS Group (matching Laravel structure)
  const cmsGroup: NavGroup = {
    heading: "CMS",
    items: [
      {
        name: "Admin Users",
        href: "/admin-users",
        icon: <Users size={18} />,
        permission: PERMISSIONS.VIEW_USERS,
      },
      {
        name: "Roles",
        href: "/roles",
        icon: <Shield size={18} />,
        permission: PERMISSIONS.VIEW_ROLES,
      },
      {
        name: "Categories",
        href: "/categories",
        icon: <FolderOutlined />,
        permission: PERMISSIONS.VIEW_CATEGORIES,
      },
      {
        name: "Tags",
        href: "/tags",
        icon: <TagsOutlined />,
        permission: PERMISSIONS.VIEW_TAGS,
      },
      {
        name: "Namaz Timings",
        href: "/Namaz",
        icon: <ClockCircleFilled />,
        permission: PERMISSIONS.VIEW_NAMAZ_TIMINGS,
      },
      {
        name: "Naat Shareefs",
        href: "/naat-Shareef",
        icon: <Headphones size={18} />,
        permission: PERMISSIONS.VIEW_NAATS,
      },
      {
        name: "Taleemat",
        href: "/taleemats",
        icon: <VideoCameraOutlined />,
        permission: PERMISSIONS.VIEW_TALEEMAT,
      },
      {
        name: "Mehfils",
        href: "/mehfil",
        icon: <SoundOutlined />,
        permission: PERMISSIONS.VIEW_MEHFILS,
      },
      {
        name: "Wazaifs",
        href: "/wazaifs",
        icon: <BookFilled />,
        permission: PERMISSIONS.VIEW_WAZAIFS,
      },
      {
        name: "Messages",
        href: "/messages",
        icon: <MessageSquare size={18} />,
        permission: PERMISSIONS.VIEW_MESSAGES,
      },
      {
        name: "Parhaiyan",
        href: "/Parhaiyan",
        icon: <ReadOutlined />,
        permission: PERMISSIONS.VIEW_PARHAIYAN,
      },
      {
        name: "Feedback",
        href: "/feedback",
        icon: <MessageCircle size={18} />,
        permission: PERMISSIONS.VIEW_FEEDBACK,
      },
      {
        name: "File Uploader",
        href: "/file-uploader",
        icon: <UploadOutlined />,
        permission: PERMISSIONS.UPLOAD_FILE,
      },
    ],
  };

  // Flatten all navigation items for path matching
  const allNavigationItems: NavItem[] = [
    homeItem,
    ...mccGroup.items,
    ...Group803.items,
    ...cmsGroup.items,
  ];

  // Memoize the selected key to prevent unnecessary recalculations
  const selectedKey = React.useMemo(() => {
    // Remove locale prefix and query parameters
    const cleanPath = pathname.replace(/^\/[a-z]{2}\//, "").split("?")[0];

    // Handle root path - default to admin
    if (cleanPath === "/" || cleanPath === "") {
      return homeItem.href;
    }

    // Find matching navigation item with improved matching logic
    // Sort by length (longest first) to match more specific routes first
    const sortedItems = [...allNavigationItems].sort((a, b) => b.href.length - a.href.length);

    const matchingItem = sortedItems.find((item) => {
      // Exact match
      if (item.href === cleanPath) return true;

      // Case-insensitive exact match
      if (item.href.toLowerCase() === cleanPath.toLowerCase()) return true;

      // Handle nested routes - if current path starts with item href followed by /
      // e.g., /admin-users/123 should match /admin-users
      if (cleanPath.startsWith(item.href + "/")) return true;

      // Handle nested routes with case-insensitive matching
      if (cleanPath.toLowerCase().startsWith(item.href.toLowerCase() + "/")) return true;

      return false;
    });

    // If found a match, return its href
    if (matchingItem) {
      return matchingItem.href;
    }

    // Fallback: if no exact match found, try to find the closest match by first segment
    if (cleanPath !== "/") {
      const pathSegments = cleanPath.split("/").filter(Boolean);
      if (pathSegments.length > 0) {
        const fallbackMatch = allNavigationItems.find((item) => {
          const itemSegments = item.href.split("/").filter(Boolean);
          if (itemSegments.length > 0) {
            // Match first segment (case-insensitive)
            return itemSegments[0].toLowerCase() === pathSegments[0].toLowerCase();
          }
          return false;
        });

        if (fallbackMatch) {
          return fallbackMatch.href;
        }
      }
    }

    // Default to empty string if no match found
    return "";
  }, [pathname]);

  const handleLogout = () => {
    logout();
  };

  // Filter navigation groups based on user permissions
  // In Laravel, super_admin users still need roles with permissions
  // Only show items that the user has explicit permission to access
  const filterGroupItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      // If no permission is specified, don't show the item
      // This ensures strict permission-based access control
      if (item.permission === null) {
        return false;
      }
      
      // Even super admins need to have the permission in their roles
      // Check permission for all users (including super admins)
      // This ensures that if a user gets "access denied" on a page,
      // they won't see that item in the sidebar either
      return hasPermission(item.permission);
    });
  };

  // Filter groups and only show groups that have at least one visible item
  const filteredMccGroup = {
    ...mccGroup,
    items: filterGroupItems(mccGroup.items),
  };

  const filteredCmsGroup = {
    ...cmsGroup,
    items: filterGroupItems(cmsGroup.items),
  };

  const filteredGroup803 = {
    ...Group803,
    items: filterGroupItems(Group803.items),
  };

  // Check if home item should be shown
  // Only show if user has explicit permission (strict permission checking)
  const showHome = homeItem.permission !== null && hasPermission(homeItem.permission);

  // Build menu items with groups (matching Laravel structure)
  const buildMenuItems = () => {
    const items: any[] = [];

    // Home item (standalone)
    if (showHome) {
      items.push({
        key: homeItem.href,
        icon: homeItem.icon,
        label: (
          <NavigationLink href={homeItem.href}>{homeItem.name}</NavigationLink>
        ),
      });
    }

    // MCC Group
    if (filteredMccGroup.items.length > 0) {
      items.push({
        type: "group",
        label: mccGroup.heading,
        children: filteredMccGroup.items.map((item) => ({
          key: item.href,
          icon: item.icon,
          label: <NavigationLink href={item.href}>{item.name}</NavigationLink>,
        })),
      });
    }

    // Group803 (CMS - Tarteeb Requests, Khatoot, Response Templates)
    if (filteredGroup803.items.length > 0) {
      items.push({
        type: "group",
        label: Group803.heading,
        children: filteredGroup803.items.map((item) => ({
          key: item.href,
          icon: item.icon,
          label: <NavigationLink href={item.href}>{item.name}</NavigationLink>,
        })),
      });
    }

    // CMS Group
    if (filteredCmsGroup.items.length > 0) {
      items.push({
        type: "group",
        label: cmsGroup.heading,
        children: filteredCmsGroup.items.map((item) => ({
          key: item.href,
          icon: item.icon,
          label: <NavigationLink href={item.href}>{item.name}</NavigationLink>,
        })),
      });
    }

    // Logout is available in the user menu popup at the bottom, so we don't add it here

    return items;
  };

  const menuItems = buildMenuItems();

  return (
    <Sider
      trigger={null} // Remove the default trigger
      collapsible
      collapsed={isCollapsed}
      breakpoint="md"
      collapsedWidth={isMobile ? 0 : 80}
      width={250}
      theme="dark"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000, // Ensure the sidebar is above other content
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDark ? "#000" : "#fff",
      }}
      className={isMobile && isCollapsed ? "hidden" : ""}
    >
      <div className="p-4 z-50 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          {!isCollapsed && (
            <span className={`text-lg transition-colors ${
              isDark ? "text-white" : "text-gray-900"
            }`}>Silsila Idreesia</span>
          )}
          {/* Custom trigger visible on all screens */}
          <Button
            type="text"
            icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar || (() => onCollapse(!isCollapsed))}
            style={{ color: isDark ? "white" : "#000" }}
            className="trigger-button"
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`rounded-full flex items-center justify-center p-1 transition-colors ${
            isDark ? "bg-[#6bb179]" : "bg-gray-200"
          }`}>
            <Image
              src={IdreesiaLogo}
              alt="IdreesiaLogo"
              width={isCollapsed ? 36 : 48}
              height={isCollapsed ? 36 : 48}
            />
          </div>
          {!isCollapsed && (
            <div className={isDark ? "text-white" : "text-gray-900"}>
              <span>{user?.name || "User"}</span>
              <div className={`text-xs transition-colors ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Role:{" "}
                {user?.is_super_admin
                  ? "Super Admin"
                  : user?.role?.name || "User"}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto min-h-90">
        <Menu
          theme={isDark ? "dark" : "light"}
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          // Important: This ensures icons remain visible in collapsed state
          inlineCollapsed={isCollapsed}
          style={{
            backgroundColor: isDark ? "#000" : "#fff",
            color: isDark ? "#fff" : "#000",
          }}
          // Custom styles for selected items
          className={`custom-sidebar-menu ${isDark ? "dark-menu" : "light-menu"}`}
          // Force re-render when pathname changes
          key={`menu-${pathname}-${resolvedTheme}`}
        />
      </div>

      {/* User Profile Section at Bottom - With Popup Menu */}
      {!isCollapsed && (
        <div className={`border-t relative user-menu-container flex-shrink-0 transition-colors ${
          isDark 
            ? "border-[#6bb179] bg-[#000]" 
            : "border-gray-200 bg-gray-50"
        }`}>
          <div
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
              isDark 
                ? "hover:bg-[#6bb179]/20" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-colors ${
              isDark 
                ? "bg-[#6bb179] text-white" 
                : "bg-gray-200 text-gray-700"
            }`}>
              {user?.name 
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate transition-colors ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {user?.name || "User"}...
              </div>
            </div>
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isDark ? "text-[#6bb179]" : "text-gray-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>

          {/* User Menu Popup */}
          {showUserMenu && (
            <div className={`absolute bottom-full left-0 right-0 mb-2 border shadow-lg rounded-lg overflow-hidden z-50 transition-colors ${
              isDark
                ? "bg-[#000] border-[#6bb179]"
                : "bg-white border-gray-200"
            }`}>
              {/* Profile Info */}
              <div className={`p-4 border-b transition-colors ${
                isDark ? "border-[#6bb179]" : "border-gray-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-colors ${
                    isDark
                      ? "bg-[#6bb179] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {user?.name 
                      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate transition-colors ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {user?.name || "User"}
                    </div>
                    <div className={`text-xs truncate transition-colors ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {user?.email || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Link */}
              <div className={`border-b transition-colors ${
                isDark ? "border-[#6bb179]" : "border-gray-200"
              }`}>
                <Link
                  href={`/${locale}/settings`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark
                      ? "text-gray-200 hover:bg-[#6bb179]/20"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={18} className={isDark ? "text-[#6bb179]" : "text-gray-500"} />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </div>

              {/* Log Out Link */}
              <div className={`border-b transition-colors ${
                isDark ? "border-[#6bb179]" : "border-gray-200"
              }`}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                    isDark
                      ? "text-gray-200 hover:bg-[#6bb179]/20"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <LogOut size={18} className={isDark ? "text-[#6bb179]" : "text-gray-500"} />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </div>

            
            </div>
          )}
        </div>
      )}

      {/* Collapsed Sidebar - Show only avatar */}
      {isCollapsed && (
        <div className="border-t border-gray-700 p-4 flex-shrink-0">
          <Link
            href={`/${locale}/settings`}
            className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm mx-auto hover:bg-gray-300 transition-colors block"
          >
            {user?.name 
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
              : 'U'}
          </Link>
        </div>
      )}
    </Sider>
  );
}

// Wrap with Layout for the full application
export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <Layout>
        <Layout.Content
          style={{
            margin: "24px 16px",
            overflow: "initial",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Mobile toggle button that appears when sidebar is hidden */}
          {isMobile && collapsed && (
            <Button
              type="primary"
              icon={<MenuUnfoldOutlined />}
              onClick={toggleSidebar}
              style={{ marginBottom: 16 }}
            />
          )}
          {children}
        </Layout.Content>
        <Layout.Footer style={{ textAlign: "center" }}>
          Silsila Idreesia ©{new Date().getFullYear()}
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}

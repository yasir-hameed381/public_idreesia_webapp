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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS, PermissionName } from "@/types/permission";
import NavigationLink from "@/components/NavigationLink";
import NProgress from "nprogress";

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
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { hasPermission, isSuperAdmin } = usePermissions();

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

  // Clean the pathname to match the navigation items
  const cleanedPathname = pathname.replace(/^\/[a-z]{2}\//, "");

  // Define navigation items with their required permissions
  const navigationItems: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    permission: PermissionName | null;
  }> = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <DashboardOutlined />,
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      name: "Admin Users",
      href: "/admin-users",
      icon: <Users size={18} />,
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      name: "Roles",
      href: "/roles",
      icon: <User size={18} />,
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
      name: "Parhaiyan",
      href: "/Parhaiyan",
      icon: <ReadOutlined />,
      permission: PERMISSIONS.VIEW_PARHAIYAN,
    },
    {
      name: "Mehfils",
      href: "/mehfil",
      icon: <SoundOutlined />,
      permission: PERMISSIONS.VIEW_MEHFILS,
    },
    {
      name: "Mehfil Directry",
      href: "/mehfildirectary",
      icon: <BookOutlined />,
      permission: PERMISSIONS.VIEW_MEHFIL_DIRECTORY,
    },
    {
      name: "zone",
      href: "/zone",
      icon: <MapPinned size={18} />,
      permission: PERMISSIONS.VIEW_ZONES,
    },
    {
      name: "Ehad Karkun Directory",
      href: "/ehadKarkun",
      icon: <Contact size={18} />,
      permission: PERMISSIONS.VIEW_EHAD_KARKUN,
    },
    {
      name: "Karkuns",
      href: "/karkunan",
      icon: <Contact size={18} />,
      permission: PERMISSIONS.VIEW_KARKUNAN,
    },
    {
      name: "Karkun Join Requests",
      href: "/karkun-join-requests",
      icon: <Users size={18} />,
      permission: PERMISSIONS.VIEW_KARKUNAN, // Using same permission as Karkuns for now
    },
    {
      name: "Mehfil Reports",
      href: "/mehfil-reports",
      icon: <FileText size={18} />,
      permission: PERMISSIONS.VIEW_MEHFIL_REPORTS,
    },
    {
      name: "Naat Shareefs",
      href: "/naat-Shareef",
      icon: <Headphones size={18} />,
      permission: PERMISSIONS.VIEW_NAATS,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: <MessageSquare size={18} />,
      permission: PERMISSIONS.VIEW_MESSAGES,
    },
    {
      name: "Feedback",
      href: "/feedback",
      icon: <MessageCircle size={18} />,
      permission: PERMISSIONS.VIEW_FEEDBACK,
    },
    {
      name: "Taleemat",
      href: "/taleemats",
      icon: <VideoCameraOutlined />,
      permission: PERMISSIONS.VIEW_TALEEMAT,
    },
    {
      name: "Namaz",
      href: "/Namaz",
      icon: <ClockCircleFilled />,
      permission: PERMISSIONS.VIEW_NAMAZ,
    },
    {
      name: "Wazaifs",
      href: "/wazaifs",
      icon: <BookFilled />,
      permission: PERMISSIONS.VIEW_WAZAIFS,
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
      icon: <User size={18} />,
      permission: PERMISSIONS.VIEW_NEW_EHADS,
    },
    {
      name: "Duty Types",
      href: "/duty-types",
      icon: <ClipboardList size={18} />,
      permission: null, // Accessible to all authenticated users
    },
    {
      name: "Duty Roster",
      href: "/duty-roster",
      icon: <Calendar size={18} />,
      permission: null, // Accessible to all authenticated users
    },
    {
      name: "Coordinators",
      href: "/coordinators",
      icon: <UserCog size={18} />,
      permission: null, // Accessible to all authenticated users
    },
    {
      name: "File Uploader",
      href: "/file-uploader",
      icon: <UploadOutlined />,
      permission: PERMISSIONS.UPLOAD_FILE,
    },
  ];

  // Memoize the selected key to prevent unnecessary recalculations
  const selectedKey = React.useMemo(() => {
    // Remove locale prefix and query parameters
    const cleanPath = pathname.replace(/^\/[a-z]{2}\//, "").split("?")[0];

    // Find matching navigation item with improved matching logic
    const matchingItem = navigationItems.find((item) => {
      // Exact match
      if (item.href === cleanPath) return true;

      // Case-insensitive match
      if (item.href.toLowerCase() === cleanPath.toLowerCase()) return true;

      // Handle nested routes - if current path starts with item href
      if (cleanPath.startsWith(item.href + "/")) return true;

      // Handle nested routes with case-insensitive matching
      if (cleanPath.toLowerCase().startsWith(item.href.toLowerCase() + "/"))
        return true;

      // Handle special cases for dashboard
      if (item.href === "/dashboard" && (cleanPath === "/" || cleanPath === ""))
        return true;

      return false;
    });

    let key = matchingItem ? matchingItem.href : cleanPath;

    // Fallback: if no exact match found, try to find the closest match
    if (!matchingItem && cleanPath !== "/") {
      const fallbackMatch = navigationItems.find((item) => {
        // Try to match the first part of the path
        const pathSegments = cleanPath.split("/").filter(Boolean);
        const itemSegments = item.href.split("/").filter(Boolean);

        if (pathSegments.length > 0 && itemSegments.length > 0) {
          return pathSegments[0] === itemSegments[0];
        }
        return false;
      });

      if (fallbackMatch) {
        key = fallbackMatch.href;
        console.log(
          "🔄 Using fallback match:",
          fallbackMatch.name,
          "for path:",
          cleanPath
        );
      }
    }

    // Debug logging
    console.log("🔍 Sidebar Selection Debug:", {
      originalPathname: pathname,
      cleanPath,
      selectedKey: key,
      matchingItem: matchingItem?.name || "None",
      allHrefs: navigationItems.map((item) => item.href),
      navigationItemsCount: navigationItems.length,
    });

    // Additional debug for specific cases
    if (cleanPath.includes("roles") || cleanPath.includes("Roles")) {
      console.log("🎯 Roles Debug:", {
        cleanPath,
        rolesItem: navigationItems.find((item) => item.href === "/roles"),
        exactMatch: navigationItems.find((item) => item.href === cleanPath),
        caseInsensitiveMatch: navigationItems.find(
          (item) => item.href.toLowerCase() === cleanPath.toLowerCase()
        ),
      });
    }

    return key;
  }, [pathname, navigationItems]);

  const handleLogout = () => {
    logout();
  };

  // Filter navigation items based on user permissions
  const navigation = navigationItems.filter((item) => {
    // If no permission required, always show
    if (item.permission === null) {
      console.log(`✅ Showing ${item.name} - No permission required`);
      return true;
    }

    // Super admin has access to everything
    if (isSuperAdmin) {
      console.log(`✅ Showing ${item.name} - Super admin access`);
      return true;
    }

    // At this point, item.permission is guaranteed to be PermissionName (not null)
    const permission = item.permission;
    const hasAccess = hasPermission(permission);
    console.log(
      `🔍 ${item.name} (${permission}): ${hasAccess ? "✅ SHOW" : "❌ HIDE"}`
    );
    return hasAccess;
  });

  const items = navigation.map((item) => ({
    key: item.href,
    icon: item.icon,
    label: <NavigationLink href={item.href}>{item.name}</NavigationLink>,
  }));

  // Add logout item separately to handle the click event
  const logoutItem = {
    key: "logout",
    icon: <LogoutOutlined />,
    label: <span onClick={handleLogout}>Logout</span>,
  };

  const allItems = [...items, logoutItem];

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
      }}
      className={isMobile && isCollapsed ? "hidden" : ""}
    >
      <div className="p-4  z-50">
        <div className="flex justify-between items-center mb-4">
          {!isCollapsed && (
            <span className="text-white text-lg">Silsila Idreesia</span>
          )}
          {/* Custom trigger visible on all screens */}
          <Button
            type="text"
            icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar || (() => onCollapse(!isCollapsed))}
            style={{ color: "white" }}
            className="trigger-button"
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gray-600 rounded-full flex items-center justify-center p-1">
            <Image
              src={IdreesiaLogo}
              alt="IdreesiaLogo"
              width={isCollapsed ? 36 : 48}
              height={isCollapsed ? 36 : 48}
            />
          </div>
          {!isCollapsed && (
            <div className="text-white">
              <span>{user?.name || "User"}</span>
              <div className="text-xs text-gray-300">
                Role:{" "}
                {user?.is_super_admin
                  ? "Super Admin"
                  : user?.role?.name || "User"}
              </div>
            </div>
          )}
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={allItems}
        // Important: This ensures icons remain visible in collapsed state
        inlineCollapsed={isCollapsed}
        style={{
          backgroundColor: "#001529", // Dark background
        }}
        // Custom styles for selected items
        className="custom-sidebar-menu"
        // Force re-render when pathname changes
        key={`menu-${pathname}`}
      />
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

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

  // Home/Dashboard (standalone, not in a group)
  const homeItem: NavItem = {
    name: "Home",
    href: "/dashboard",
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
        permission: null,
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
    ...cmsGroup.items,
  ];

  // Memoize the selected key to prevent unnecessary recalculations
  // const selectedKey = React.useMemo(() => {
  //   // Remove locale prefix and query parameters
  //   const cleanPath = pathname.replace(/^\/[a-z]{2}\//, "").split("?")[0];

  //   // Find matching navigation item with improved matching logic
  //   // const matchingItem = allNavigationItems.find((item) => {
  //   //   // Exact match
  //   //   if (item.href === cleanPath) return true;

  //   //   // Case-insensitive match
  //   //   if (item.href.toLowerCase() === cleanPath.toLowerCase()) return true;

  //   //   // Handle nested routes - if current path starts with item href
  //   //   if (cleanPath.startsWith(item.href + "/")) return true;

  //   //   // Handle nested routes with case-insensitive matching
  //   //   if (cleanPath.toLowerCase().startsWith(item.href.toLowerCase() + "/"))
  //   //     return true;

  //   //   // Handle special cases for dashboard
  //   //   if (item.href === "/dashboard" && (cleanPath === "/" || cleanPath === ""))
  //   //     return true;

  //   //   return false;
  //   // });

  //  // let key = matchingItem ? matchingItem.href : cleanPath;

  //   // Fallback: if no exact match found, try to find the closest match
  //   // if (!matchingItem && cleanPath !== "/") {
  //   //   const fallbackMatch = allNavigationItems.find((item) => {
  //   //     // Try to match the first part of the path
  //   //     const pathSegments = cleanPath.split("/").filter(Boolean);
  //   //     const itemSegments = item.href.split("/").filter(Boolean);

  //   //     if (pathSegments.length > 0 && itemSegments.length > 0) {
  //   //       return pathSegments[0] === itemSegments[0];
  //   //     }
  //   //     return false;
  //   //   });

  //   //   if (fallbackMatch) {
  //   //     key = fallbackMatch.href;
  //   //   }
  //   // }

  //   return key;
  // }, [pathname]);

  const handleLogout = () => {
    logout();
  };

  // Filter navigation groups based on user permissions
  // In Laravel, super_admin users still need roles with permissions
  const filterGroupItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      // If no permission required, always show
      if (item.permission === null) {
        return true;
      }
      
      // For super admin, only show specific items: Khatoot/Masail, Response Templates, and Tarteeb Requests
      if (isSuperAdmin) {
        const allowedForSuperAdmin = [
          "/khatoot",
          "/response-templates",
          "/tarteeb-requests"
        ];
        return allowedForSuperAdmin.includes(item.href);
      }
      
      // Check permission for non-super-admin users
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

  // Check if home item should be shown
  const showHome =
    homeItem.permission === null || hasPermission(homeItem.permission);

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

    // Add logout item
    items.push({
      key: "logout",
      icon: <LogOut size={18} />,
      label: <span onClick={handleLogout}>Logout</span>,
    });

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
       // selectedKeys={[selectedKey]}
        items={menuItems}
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

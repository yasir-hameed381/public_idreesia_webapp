"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFetchCommitteePortalContextQuery } from "@/store/slicers/committeesApi";
import { useTheme } from "@/context/useTheme";
import { Button, Layout, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  Bell,
  ChevronUp,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
  Users,
  Vote,
} from "lucide-react";

const { Sider } = Layout;

export default function CommitteePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const { user, logout, isAuthenticated, isInitialized } = useAuth();
  const { resolvedTheme } = useTheme();
  const { data, isLoading } = useFetchCommitteePortalContextQuery(undefined, {
    skip: !isAuthenticated,
  });
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params?.locale || "en";
  const isDark = resolvedTheme === "dark";

  const hasAccess = !!data?.has_access;

  useEffect(() => {
    if (isInitialized && (!user || !isAuthenticated)) {
      router.push(`/${locale}/login`);
    }
  }, [isInitialized, user, isAuthenticated, router, locale]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickedInUserMenu = !!target.closest(".committee-user-menu");
      const clickedInNotificationMenu = !!target.closest(".committee-notification-menu");
      if (!clickedInUserMenu) {
        setShowUserMenu(false);
      }
      if (!clickedInNotificationMenu) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading committee portal...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You are not assigned to any committee.
          </p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const selectedCommittee = data?.selected_committee?.committee;
  const navItems = [
    { href: `/${locale}/committee-portal/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/${locale}/committee-portal/inbox`, label: "Inbox", icon: MessageSquare },
    { href: `/${locale}/committee-portal/members`, label: "Members", icon: Users },
    { href: `/${locale}/committee-portal/documents`, label: "Documents", icon: FileText },
    { href: `/${locale}/committee-portal/meetings`, label: "Meetings", icon: Bell },
    { href: `/${locale}/committee-portal/polls`, label: "Polls", icon: Vote },
  ];
  const selectedKey =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href || "";

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-black" : "bg-[#f5f3f1]"}`}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={isMobile ? 0 : 80}
        width={280}
        theme={isDark ? "dark" : "light"}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          backgroundColor: isDark ? "#000" : "#fff",
          borderRight: isDark ? "1px solid #1f2937" : "1px solid #e5e7eb",
        }}
        className={isMobile && collapsed ? "hidden" : ""}
      >
        <div className="p-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            {!collapsed && (
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Committee Portal
              </h2>
            )}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: isDark ? "white" : "#111827" }}
            />
          </div>

          {!collapsed && (
            <div className="space-y-2 border-t pt-3 border-gray-200/60">
              <div className={`text-sm font-medium px-3 py-2 rounded-md ${
                isDark ? "bg-[#111827] text-gray-100" : "bg-indigo-50 text-indigo-700"
              }`}>
                {selectedCommittee?.name || "Committee"}
              </div>
              {selectedCommittee?.parent_name && (
                <div className={`text-xs px-3 py-2 rounded-md ${
                  isDark ? "bg-[#2b1a00] text-amber-200" : "bg-amber-50 text-amber-700"
                }`}>
                  Sub committee of {selectedCommittee.parent_name}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <Menu
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            inlineCollapsed={collapsed}
            theme={isDark ? "dark" : "light"}
            style={{ backgroundColor: isDark ? "#000" : "#fff" }}
            items={navItems.map((item) => {
              const Icon = item.icon;
              return {
                key: item.href,
                icon: <Icon size={16} />,
                label: (
                  <button
                    onClick={() => router.push(item.href)}
                    className="w-full text-left"
                  >
                    {item.label}
                  </button>
                ),
              };
            })}
          />
        </div>
        {!collapsed && (
          <div className={`p-3 border-t committee-user-menu relative flex-shrink-0 ${
            isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-gray-50"
          }`}>
            <div className={`mt-39 flex items-center justify-between px-3 py-2 rounded-md border-2 border-gray-200 ${
              isDark ? "hover:bg-gray-900" : "hover:bg-gray-100"
            }`}>
              <button
                onClick={() => router.push(`/${locale}`)}
                className={`flex items-center gap-2 text-sm border-2 border-gray-200 rounded-md p-2 hover:bg-gray-200 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Home size={16} />
                <span>Back to Home</span>
              </button>
              <button
                onClick={() => {
                  setShowNotificationsMenu((prev) => !prev);
                  setShowUserMenu(false);
                }}
                className={`p-1 rounded-md border-2 border-gray-200 ${
                  isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Notifications"
              >
                <Bell size={18} />
              </button>
            </div>

            {showNotificationsMenu && (
              <div
                className={`committee-notification-menu fixed w-[300px] max-w-[calc(100vw-32px)] border rounded-xl shadow-lg overflow-hidden z-[1200] ${
                  isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
                }`}
                style={{
                  left: isMobile ? 16 : collapsed ? 96 : 250,
                  bottom: isMobile ? 80 : 92,
                }}
              >
                <div
                  className={`px-4 py-3 font-semibold border-b ${
                    isDark ? "text-white border-gray-800" : "text-gray-900 border-gray-200"
                  }`}
                >
                  Notifications
                </div>
                <div
                  className={`px-4 py-8 text-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No new notifications
                </div>
                <div
                  className={`px-4 py-2 border-t ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                ></div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                  isDark ? "hover:bg-gray-900" : "hover:bg-gray-100"
                }`}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  isDark ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
                }`}>
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                    {user?.name || "User"}
                  </div>
                  <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {user?.email || ""}
                  </div>
                </div>
                <ChevronUp
                  size={14}
                  className={`transition-transform ${showUserMenu ? "rotate-180" : ""} ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
            </div>

            

            {showUserMenu && (
              <div className={`mt-2 border rounded-lg overflow-hidden ${
                isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
              }`}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push(`/${locale}/profile`);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
                    isDark ? "text-gray-200 hover:bg-gray-900" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
                    isDark ? "text-red-300 hover:bg-gray-900" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}            
          </div>
        )}
        {collapsed && (
          <div className="p-2 border-t border-gray-200/50 flex flex-col gap-2">
            <button
              onClick={() => router.push(`/${locale}`)}
              className={`p-2 rounded-md flex items-center justify-center ${
                isDark ? "text-gray-200 hover:bg-gray-900" : "text-gray-700 hover:bg-gray-100"
              }`}
              title="Back to Home"
            >
              <Home size={16} />
            </button>
            <button
              onClick={logout}
              className={`p-2 rounded-md flex items-center justify-center ${
                isDark ? "text-red-300 hover:bg-gray-900" : "text-red-600 hover:bg-red-50"
              }`}
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </Sider>

      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-[999]"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className="flex-1 min-w-0" style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 280 }}>
        <div className={`md:hidden border-b px-4 py-3 flex items-center justify-between ${
          isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
        }`}>
          <div>
            <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Committee Portal
            </div>
            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {selectedCommittee?.name || "Committee"}
            </div>
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: isDark ? "white" : "#111827" }}
          />
        </div>
        <main className={`px-4 py-6 md:px-6 ${isDark ? "text-gray-100" : ""}`}>{children}</main>
      </div>
    </div>
  );
}


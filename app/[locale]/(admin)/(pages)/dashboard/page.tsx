"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Menu,
  LogOut,
  Globe,
  Building,
  Users,
  Play,
  Music,
  Mic,
  BookOpen,
  Bell,
  UserCheck,
  Clock,
  GraduationCap,
  MapPin,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard, usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { useGetDashboardStatsQuery } from "@/store/slicers/dashboardStatsApi";
import { useFetchZonesQuery } from "@/store/slicers/zoneApi";
import { useFetchMehfilsDataQuery } from "@/store/slicers/mehfilApi";
import { useFetchKarkunsQuery } from "@/store/slicers/EhadKarkunApi";
import { useFetchNaatSharifDataQuery } from "@/store/slicers/naatsharifApi";
import { useGetTaleematQuery } from "@/store/slicers/taleematApi";
import { useGetWazaifQuery } from "@/store/slicers/wazaifApi";
import { useGetMessagesQuery } from "@/store/slicers/messagesApi";
import { useFetchKarkunJoinRequestsDataQuery } from "@/store/slicers/karkunJoinRequestsApi";
import { useGetNamazQuery } from "@/store/slicers/NamazApi";
import { useGetParhaiyanQuery } from "@/store/slicers/parhaiyanApi";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState("Last 7 Days");
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();
  const params = useParams();
  const locale = params.locale as string;

  // Fetch dashboard statistics based on time period
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
    refetch,
  } = useGetDashboardStatsQuery({
    timePeriod,
  });

  // Fallback: Fetch individual data using existing APIs
  const { data: zonesData, isLoading: isZonesLoading } = useFetchZonesQuery({
    page: 1,
    per_page: 1,
  });
  const { data: mehfilsData, isLoading: isMehfilsLoading } =
    useFetchMehfilsDataQuery({ page: 1, size: 1 });
  const { data: karkunsData, isLoading: isKarkunsLoading } =
    useFetchKarkunsQuery({ page: 1, size: 1 });
  const { data: naatsData, isLoading: isNaatsLoading } =
    useFetchNaatSharifDataQuery({
      page: 1,
      size: 1,
      search: "",
      category: "all",
    });
  const { data: taleematData, isLoading: isTaleematLoading } =
    useGetTaleematQuery({ page: 1, size: 1, search: "" });
  const { data: wazaifData, isLoading: isWazaifLoading } = useGetWazaifQuery({
    page: 1,
    limit: 1,
    search: "",
  });
  const { data: messagesData, isLoading: isMessagesLoading } =
    useGetMessagesQuery({ page: 1, size: 1, search: "" });
  const {
    data: karkunJoinRequestsData,
    isLoading: isKarkunJoinRequestsLoading,
  } = useFetchKarkunJoinRequestsDataQuery({ page: 1, size: 1, search: "" });
  const { data: namazData, isLoading: isNamazLoading } = useGetNamazQuery({
    page: 1,
    size: 1,
    search: "",
  });
  const { data: parhaiyanData, isLoading: isParhaiyanLoading } =
    useGetParhaiyanQuery({ page: 1, size: 1, search: "" });

  // Refetch data when time period changes
  useEffect(() => {
    refetch();
  }, [timePeriod, refetch]);

  const handleLogout = () => {
    logout();
  };

  // Determine if we should use fallback data
  const useFallbackData = !statsData?.data || statsError;

  // Get stats with fallback to individual API data if dashboard stats API is not available
  const stats = useFallbackData
    ? {
        zones: zonesData?.meta?.total || 0,
        mehfilDirectory: mehfilsData?.meta?.total || 0,
        ehadKarkuns: karkunsData?.meta?.total || 0,
        totalMehfils: mehfilsData?.meta?.total || 0,
        totalNaats: naatsData?.meta?.total || 0,
        totalTaleemat: taleematData?.meta?.total || 0,
        totalWazaifs: wazaifData?.meta?.total || 0,
        messagesSent: messagesData?.meta?.total || 0,
        karkunJoinRequests: karkunJoinRequestsData?.meta?.total || 0,
        namazTimings: namazData?.meta?.total || 0,
        parhaiyan: parhaiyanData?.meta?.total || 0,
      }
    : {
        zones: statsData?.data?.zones || 0,
        mehfilDirectory: statsData?.data?.mehfilDirectory || 0,
        ehadKarkuns: statsData?.data?.ehadKarkuns || 0,
        totalMehfils: statsData?.data?.totalMehfils || 0,
        totalNaats: statsData?.data?.totalNaats || 0,
        totalTaleemat: statsData?.data?.totalTaleemat || 0,
        totalWazaifs: statsData?.data?.totalWazaifs || 0,
        messagesSent: statsData?.data?.messagesSent || 0,
        karkunJoinRequests:
          statsData?.data?.karkunJoinRequests ||
          karkunJoinRequestsData?.meta?.total ||
          0,
        namazTimings:
          statsData?.data?.namazTimings || namazData?.meta?.total || 0,
        parhaiyan:
          statsData?.data?.parhaiyan || parhaiyanData?.meta?.total || 0,
      };

  // Combined loading state
  const isLoading = useFallbackData
    ? isZonesLoading ||
      isMehfilsLoading ||
      isKarkunsLoading ||
      isNaatsLoading ||
      isTaleematLoading ||
      isWazaifLoading ||
      isMessagesLoading ||
      isKarkunJoinRequestsLoading ||
      isNamazLoading ||
      isParhaiyanLoading
    : isStatsLoading;

  const dashboardCards = [
    {
      icon: Globe,
      label: "Zones",
      value: stats.zones.toString(),
      color: "text-purple-600",
      loading: isLoading,
    },
    {
      icon: Building,
      label: "Mehfil Directory",
      value: stats.mehfilDirectory.toString(),
      color: "text-green-600",
      loading: isLoading,
    },
    {
      icon: Users,
      label: "New Ehads",
      value: stats.ehadKarkuns.toString(),
      color: "text-blue-600",
      loading: isLoading,
    },
    {
      icon: Play,
      label: "Total Mehfils",
      value: stats.totalMehfils.toString(),
      color: "text-purple-600",
      loading: isLoading,
    },
    {
      icon: Music,
      label: "Total Naats",
      value: stats.totalNaats.toString(),
      color: "text-pink-600",
      loading: isLoading,
    },
    {
      icon: Mic,
      label: "Total Taleemat",
      value: stats.totalTaleemat.toString(),
      color: "text-orange-600",
      loading: isLoading,
    },
    {
      icon: BookOpen,
      label: "Total Wazaifs",
      value: stats.totalWazaifs.toString(),
      color: "text-teal-600",
      loading: isLoading,
    },
    {
      icon: Bell,
      label: "Messages Sent",
      value: stats.messagesSent.toString(),
      color: "text-red-600",
      loading: isLoading,
    },
    {
      icon: UserCheck,
      label: "Karkun Join Requests",
      value: stats.karkunJoinRequests.toString(),
      color: "text-indigo-600",
      loading: isLoading,
    },
    {
      icon: Clock,
      label: "Namaz Timings",
      value: stats.namazTimings.toString(),
      color: "text-cyan-600",
      loading: isLoading,
    },
    {
      icon: GraduationCap,
      label: "Parhaiyan",
      value: stats.parhaiyan.toString(),
      color: "text-amber-600",
      loading: isLoading,
    },
  ];

  // Quick Access Links with permissions (matching Laravel home.blade.php)
  const allQuickAccessLinks = [
    {
      icon: Globe,
      label: "Regions",
      href: `/${locale}/regions`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      permission: PERMISSIONS.VIEW_REGIONS,
    },
    {
      icon: MapPin,
      label: "Zones",
      href: `/${locale}/zone`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      permission: PERMISSIONS.VIEW_ZONES,
    },
    {
      icon: Building,
      label: "Mehfil Directory",
      href: `/${locale}/mehfildirectary`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      permission: PERMISSIONS.VIEW_MEHFIL_DIRECTORY,
    },
    {
      icon: FileText,
      label: "Mehfil Reports",
      href: `/${locale}/mehfil-reports`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      permission: PERMISSIONS.VIEW_MEHFIL_REPORTS,
    },
    {
      icon: Users,
      label: "Karkuns",
      href: `/${locale}/karkunan`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      permission: PERMISSIONS.VIEW_KARKUNS,
    },
    {
      icon: UserCheck,
      label: "New Ehads",
      href: `/${locale}/new-ehads`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      permission: PERMISSIONS.VIEW_NEW_EHADS,
    },
    {
      icon: Bell,
      label: "Messages",
      href: `/${locale}/messages`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      permission: PERMISSIONS.VIEW_MESSAGES,
    },
    {
      icon: GraduationCap,
      label: "Parhaiyan",
      href: `/${locale}/Parhaiyan`,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      permission: PERMISSIONS.VIEW_PARHAIYAN,
    },
    {
      icon: Clock,
      label: "Namaz Timings",
      href: `/${locale}/Namaz`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      permission: PERMISSIONS.VIEW_NAMAZ_TIMINGS,
    },
    {
      icon: Music,
      label: "Naat Shareef",
      href: `/${locale}/naat-Shareef`,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      permission: PERMISSIONS.VIEW_NAATS,
    },
    {
      icon: Mic,
      label: "Taleemat",
      href: `/${locale}/taleemats`,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      permission: PERMISSIONS.VIEW_TALEEMAT,
    },
    {
      icon: BookOpen,
      label: "Wazaifs",
      href: `/${locale}/wazaifs`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      permission: PERMISSIONS.VIEW_WAZAIFS,
    },
  ];

  // Filter quick access links based on permissions (matching Laravel @can directives)
  const quickAccessLinks = allQuickAccessLinks.filter((link) =>
    hasPermission(link.permission)
  );

  return (
    <PermissionGuard
      permission={PERMISSIONS.VIEW_DASHBOARD}
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-4">
              Access Denied
            </div>
            <p className="text-gray-600">
              You don't have permission to view the dashboard.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-gray-600 hover:text-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">CMS</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </header>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Welcome Section - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-right">
                  السَّلَامُ عَلَيْكُمْ وَرَحْمَهُ اللَّهِ وَبَرَكَاتُهُ
                </h2>
                <div className="mb-4">
                  <hr className="border-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to CMS
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    You can start using the portal by navigating to desired page
                    from sidebar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-800">Quick Access</h2>
            </div>
            {quickAccessLinks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {quickAccessLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`${link.bgColor} rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center group cursor-pointer`}
                  >
                    <link.icon
                      className={`h-10 w-10 ${link.color} mb-3 group-hover:scale-110 transition-transform`}
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No quick access links available based on your permissions.</p>
              </div>
            )}
          </div>

          {/* Need Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">?</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-600">
                  For technical support, feature requests, or reporting issues,
                  please contact your system administrator.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}

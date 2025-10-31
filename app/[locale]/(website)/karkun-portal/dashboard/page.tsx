"use client";

/**
 * Karkun Dashboard with Role-Based Filtering
 * 
 * This dashboard implements role-based zone and mehfil filtering similar to the Laravel application.
 * 
 * Role-Based Access Control:
 * - Super Admin / All Region Admin: Can see all zones and switch between them
 * - Region Admin: Can only see zones in their region
 * - Zone Admin: Can only see their own zone (pre-selected and locked)
 * - Mehfil Admin: Can only see their zone and mehfil (both pre-selected and locked)
 * 
 * Key Features:
 * 1. Zones and mehfils are filtered on the backend based on user permissions
 * 2. Zone/Mehfil admins have their zone/mehfil pre-selected automatically
 * 3. Cascading filters: changing zone resets mehfil selection
 * 4. Stats are calculated based on selected filters
 * 5. Different sections visible based on role (Region Stats, Zone Stats, etc.)
 */

import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

import {
  DashboardService,
  DashboardStats as DashboardStatsType,
  DashboardFilters,
  OverallTotals,
} from "@/services/Dashboard/dashboard-service";

interface Zone {
  id: number;

  title_en: string;

  city_en: string;

  country_en: string;
}

interface Mehfil {
  id: number;

  mehfil_number: string;

  name_en: string;

  address_en: string;
}

interface DashboardState extends DashboardStatsType {
  loading: boolean;

  zones: Zone[];

  mehfils: Mehfil[];
}

const KarkunDashboardPage: React.FC = () => {
  // const { user,user.zone_id } = useAuth();
  const { user } = useAuth();
  console.log(user?.zone_id)

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth() + 1;

  const currentYear = currentDate.getFullYear();

  // Filter states

  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentMonth > 1 ? currentMonth - 1 : 12
  );

  const [selectedYear, setSelectedYear] = useState<number>(
    currentMonth > 1 ? currentYear : currentYear - 1
  );

  // Initialize zone and mehfil based on user role
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardState>({
    loading: true,

    zones: [],

    mehfils: [],

    totalKarkuns: 0,

    ehadKarkuns: 0,

    totalNewEhads: 0,

    totalTabarukats: 0,

    totalMehfils: 0,

    mehfilsWithReports: 0,

    mehfilsWithoutReports: 0,

    reportSubmissionRate: 0,

    mehfilsWithReportsList: [],

    mehfilsWithoutReportsList: [],

    hasSubmittedReport: false,

    monthlyAttendanceDays: 0,

    totalDutyKarkuns: 0,

    totalZones: 0,

    zonesWithReports: 0,

    zoneReportStats: [],
  });

  const [overallTotals, setOverallTotals] = useState<OverallTotals | null>(
    null
  );

  const [loadingTotals, setLoadingTotals] = useState(true);

  // Months mapping

  const months: Record<number, string> = {
    1: "January",

    2: "February",

    3: "March",

    4: "April",

    5: "May",

    6: "June",

    7: "July",

    8: "August",

    9: "September",

    10: "October",

    11: "November",

    12: "December",
  };

  // Initialize zone/mehfil selection based on user role (only once on mount)
  useEffect(() => {
    if (user) {
      // Zone admin or mehfil admin - pre-select their zone
      if (user.is_zone_admin || user.is_mehfil_admin) {
        console.log("Setting selectedZoneId to:", user.zone_id);
        console.log("Setting users:", user);
        setSelectedZoneId(user.zone_id || null);
        console.log("SelectedZoneId:", selectedZoneId);
      } else {
        console.log("User is not zone/mehfil admin, zone_id:", user.zone_id);
      }
      // Mehfil admin - pre-select their mehfil
      if (user.is_mehfil_admin) {
        setSelectedMehfilId(user.mehfil_directory_id || null);
      }
    }
  }, [user]);

  // Load overall totals (only once on mount)

  useEffect(() => {
    const fetchOverallTotals = async () => {
      try {
        setLoadingTotals(true);

        const totals = await DashboardService.getOverallTotals();

        setOverallTotals(totals);
      } catch (error) {
        console.error("Error fetching overall totals:", error);
      } finally {
        setLoadingTotals(false);
      }
    };

    fetchOverallTotals();
  }, []);

  // Load dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        const filters: DashboardFilters = {
          selectedMonth,
          selectedYear,
          selectedZoneId,
          selectedMehfilId,
        };

        const dashboardData = await DashboardService.getDashboardStats(filters);

        console.log("📊 Dashboard data received:", {
          totalZones: dashboardData.zones?.length || 0,
          totalMehfils: dashboardData.mehfils?.length || 0,
          zones: dashboardData.zones,
          mehfils: dashboardData.mehfils,
          totalKarkuns: dashboardData.totalKarkuns,
        });

        setStats((prev) => ({
          ...prev,
          ...dashboardData,
          zones: dashboardData.zones || prev.zones,
          mehfils: prev.mehfils?.length > 0 ? prev.mehfils : dashboardData.mehfils,
          loading: false,
        }));
        
        console.log("🔍 Stats after setting:", {
          zonesCount: dashboardData.zones?.length || 0,
          mehfilsCount: dashboardData.mehfils?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [selectedMonth, selectedYear, selectedZoneId, selectedMehfilId]);

  // Load mehfils when zone changes
  useEffect(() => {
    console.log("🔄 Mehfils useEffect triggered, selectedZoneId:", selectedZoneId);
    
    const loadMehfils = async () => {
      if (selectedZoneId) {
        try {
          console.log(`📋 Calling getMehfilsForZone for zone ${selectedZoneId}`);
          const mehfils = await DashboardService.getMehfilsForZone(selectedZoneId);
          console.log(`📋 Loaded ${mehfils.length} mehfils for zone ${selectedZoneId}:`, mehfils);
          setStats((prev) => ({
            ...prev,
            mehfils,
          }));
        } catch (error) {
          console.error("Error loading mehfils:", error);
        }
      } else {
        console.log("⚠️ No selectedZoneId, clearing mehfils");
        // Clear mehfils when no zone is selected
        setStats((prev) => ({
          ...prev,
          mehfils: [],
        }));
      }
    };

    loadMehfils();
  }, [selectedZoneId]);

  // Check if user can filter zones (Region admins can change zones)
  const canFilterZones: boolean = Boolean(
    user?.is_super_admin || user?.is_region_admin
  );

  // Check if user can filter mehfils (Region and Zone admins can change mehfils)
  const canFilterMehfils: boolean = Boolean(
    canFilterZones || user?.is_zone_admin
  );

  // Handle zone change - reset mehfil selection and update stats
  const handleZoneChange = (newZoneId: string) => {
    const zoneId = newZoneId ? Number(newZoneId) : null;
    setSelectedZoneId(zoneId);
    setSelectedMehfilId(null); // Reset mehfil when zone changes
  };

  // Get selected zone name

  const getSelectedZoneName = (): string => {
    if (!stats.zones || stats.zones.length === 0) {
      return user?.zone?.title_en || "Loading...";
    }

    console.log("🔍 Getting selected zone name - stats.zones:", stats.mehfils);

    const zone = stats.zones.find((z) => z.id === selectedZoneId);

    console.log("🔍 Selected zone details:", zone);

    return zone
      ? `${zone.title_en} - ${zone.city_en}, ${zone.country_en}`
      : "All Zones";
  };

  // Debug: log stats.zones before render
  console.log("🔍 Render - stats.zones:", stats.zones, "length:", stats.zones?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2
            className="text-xl font-semibold text-gray-800 mb-2"
            style={{ direction: "rtl" }}
          >
            السلام عليكم ورحمة الله وبركاته
          </h2>

          <p className="text-gray-700 font-medium mb-4">
            Welcome to Karkun Portal
          </p>

          {/* User Zone Context */}

          {user?.zone && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Zone</p>

              <p className="font-semibold text-gray-900">
                {user.zone.title_en}
              </p>

              {user.zone.city_en && (
                <p className="text-sm text-gray-600">
                  {user.zone.city_en}, {user.zone.country_en}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Filter Dropdowns */}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Zone Dropdown */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>

              {(() => {
                console.log("🔍 Inside dropdown render - stats.zones:", stats.zones);
                return (
                  <select
                    value={selectedZoneId || ""}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    disabled={!canFilterZones}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                      !canFilterZones
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : ""
                    }`}
                  >
                    <option value={stats.zones.length > 0 ? stats.zones[0].title_en : ""}>{stats.zones.length > 0 ? stats.zones[0].title_en : "All zones"}</option>

                    {stats.zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.title_en} - {zone.city_en}
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>

            {/* Mehfil Dropdown */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mehfil
              </label>

              <select
                value={selectedMehfilId || ""}
                onChange={(e) =>
                  setSelectedMehfilId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!canFilterMehfils}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                  !canFilterMehfils
                    ? "opacity-50 cursor-not-allowed bg-gray-50"
                    : ""
                }`}
              >
                <option value={stats.mehfils.length > 0 ? stats.mehfils[0].id : ""}>{"All Mehfils"}</option>

                {stats.mehfils.map((mehfil) => (
                  <option key={mehfil.id} value={mehfil.id}>
                    #{mehfil.mehfil_number} - {mehfil.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {Object.entries(months).map(([num, name]) => (
                  <option key={num} value={num}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {[
                  currentYear + 1,

                  currentYear,

                  currentYear - 1,

                  currentYear - 2,
                ].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Statistics Cards */}

          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Overall Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Karkuns */}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Karkuns
                  </h3>

                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>

                {loadingTotals ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {overallTotals?.totalKarkunans || 0}
                  </p>
                )}
              </div>

              {/* Ehad Karkuns */}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Ehad Karkuns
                  </h3>

                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>

                {loadingTotals ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {overallTotals?.totalEhadKarkuns || 0}
                  </p>
                )}
              </div>

              {/* Total Mehfils */}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Mehfils
                  </h3>

                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {loadingTotals ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {overallTotals?.totalMehfils || 0}
                  </p>
                )}
              </div>

              {/* Total Zones */}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Zones
                  </h3>

                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-cyan-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {loadingTotals ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {overallTotals?.totalZones || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Report Summary Section Header */}

          <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
            Report Summary - {months[selectedMonth]} {selectedYear}
          </h3>

          {/* Monthly Report Statistics */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Ehads */}

            {/* Total New Ehads */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">New Ehads</h3>

                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {stats.loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalNewEhads || 0}
                </p>
              )}
            </div>

            {/* Reports Submitted */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Reports Submitted
                </h3>

                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {stats.loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats.mehfilsWithReports || 0}
                </p>
              )}
            </div>

            {/* Reports Pending */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Reports Pending
                </h3>

                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {stats.loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats.mehfilsWithoutReports || 0}
                </p>
              )}
            </div>

            {/* Total Tabarukats */}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Tabarukats
                </h3>

                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
                      clipRule="evenodd"
                    />

                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                  </svg>
                </div>
              </div>

              {stats.loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalTabarukats || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Region Stats Table - Show when region admin and no zone selected */}

        {(user?.is_super_admin || user?.is_region_admin) &&
          !selectedZoneId &&
          stats.zoneReportStats.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Region Stats
                  </h2>

                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                    {stats.totalZones} Zones
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zone
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Mehfils
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Karkun
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ehad Karkun
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tabarukats
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          New Ehad
                          <br />
                          <span className="text-[10px] font-normal text-gray-400">
                            ({months[selectedMonth]} {selectedYear})
                          </span>
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reports Submitted
                          <br />
                          <span className="text-[10px] font-normal text-gray-400">
                            ({months[selectedMonth]} {selectedYear})
                          </span>
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission Rate
                          <br />
                          <span className="text-[10px] font-normal text-gray-400">
                            ({months[selectedMonth]} {selectedYear})
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.zoneReportStats.map((zoneStat) => (
                        <tr key={zoneStat.zone_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.zone_name}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.total_mehfils}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.karkun}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.ehad_karkun}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.tabarukats}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.new_ehad}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {zoneStat.reports_submitted}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                zoneStat.submission_rate >= 80
                                  ? "bg-green-100 text-green-700"
                                  : zoneStat.submission_rate >= 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {zoneStat.submission_rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* Zone Stats - Show when zone is selected */}
{/* 
        {selectedZoneId && !selectedMehfilId && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Zone Stats - {getSelectedZoneName()}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Mehfils
                  </h3>

                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-cyan-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {stats.loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalMehfils}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Total Karkuns
                  </h3>

                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>

                {stats.loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalKarkuns}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">
                      Ehad Karkuns
                    </h3>

                    {stats.loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    ) : (
                      <p className="text-4xl font-bold text-green-700">
                        {stats.ehadKarkuns}
                      </p>
                    )}
                  </div>

                  <div className="bg-green-200 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-green-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">
                      Tabarukats
                    </h3>

                    {stats.loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    ) : (
                      <p className="text-4xl font-bold text-orange-700">
                        {stats.totalTabarukats}
                      </p>
                    )}
                  </div>

                  <div className="bg-orange-200 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-orange-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">
                      New Ehads ({months[selectedMonth]} {selectedYear})
                    </h3>

                    {stats.loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    ) : (
                      <p className="text-4xl font-bold text-purple-700">
                        {stats.totalNewEhads}
                      </p>
                    )}
                  </div>

                  <div className="bg-purple-200 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-purple-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Zone Stats - Show when zone is selected but no mehfil */}

        {selectedZoneId && !selectedMehfilId && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Zone Stats - {getSelectedZoneName()}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-md p-6 border border-cyan-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">
                      Total Mehfils
                    </h3>

                    {stats.loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                    ) : (
                      <p className="text-4xl font-bold text-cyan-700">
                        {stats.totalMehfils}
                      </p>
                    )}
                  </div>

                  <div className="bg-cyan-200 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-cyan-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">
                      Total Karkuns
                    </h3>

                    {stats.loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                      <p className="text-4xl font-bold text-blue-700">
                        {stats.totalKarkuns}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-200 p-3 rounded-lg">
                    <svg
                      className="w-8 h-8 text-blue-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Ehad Karkuns
                  </h3>

                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>

                {stats.loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.ehadKarkuns}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Tabarukats
                  </h3>

                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {stats.loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalTabarukats}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Summary Section - Only show when zone is selected */}

        {selectedZoneId && !selectedMehfilId && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Report Summary - {months[selectedMonth]} {selectedYear}
            </h2>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-5">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    New Ehads
                  </h3>

                  {stats.loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-700">
                      {stats.totalNewEhads}
                    </p>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg border border-green-200 p-5">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Reports Submitted
                  </h3>

                  {stats.loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  ) : (
                    <p className="text-3xl font-bold text-green-700">
                      {stats.mehfilsWithReports}
                    </p>
                  )}
                </div>

                <div className="bg-red-50 rounded-lg border border-red-200 p-5">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Reports Pending
                  </h3>

                  {stats.loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  ) : (
                    <p className="text-3xl font-bold text-red-700">
                      {stats.mehfilsWithoutReports}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Submission Rate
                  </h3>

                  {stats.loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <p className="text-3xl font-bold text-blue-700">
                      {stats.reportSubmissionRate.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Mehfils With and Without Reports */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Submitted Reports List */}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-green-700 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Submitted Reports ({stats.mehfilsWithReports})
                    </h3>
                  </div>

                  {stats.loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : stats.mehfilsWithReportsList.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {stats.mehfilsWithReportsList.map((mehfil) => (
                        <div
                          key={mehfil.id}
                          className="border border-green-100 rounded-lg p-3 bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                #{mehfil.mehfil_number} - {mehfil.name}
                              </p>

                              <p className="text-xs text-gray-600 mt-1">
                                {mehfil.address}
                              </p>

                              {mehfil.coordinator_name && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Coordinator: {mehfil.coordinator_name}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Mehfil Days: {mehfil.mehfil_days_in_month}
                                </span>

                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                  Total Duty Karkuns:{" "}
                                  {mehfil.total_duty_karkuns}
                                </span>
                              </div>
                            </div>

                            <div className="text-right ml-2 flex-shrink-0">
                              <span className="inline-flex items-center gap-1 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
                                ✓ Submitted
                              </span>

                              {mehfil.submitted_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {mehfil.submitted_at}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      No reports submitted yet.
                    </p>
                  )}
                </div>

                {/* Pending Reports List */}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-red-700 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pending Reports ({stats.mehfilsWithoutReports})
                    </h3>
                  </div>

                  {stats.loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : stats.mehfilsWithoutReportsList.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {stats.mehfilsWithoutReportsList.map((mehfil) => (
                        <div
                          key={mehfil.id}
                          className="border border-yellow-100 rounded-lg p-3 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                #{mehfil.mehfil_number} - {mehfil.name}
                              </p>

                              <p className="text-xs text-gray-600 mt-1">
                                {mehfil.address}
                              </p>

                              {mehfil.zimdar_bhai_name && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500">
                                    Zimdar Bhai: {mehfil.zimdar_bhai_name}
                                  </p>

                                  {mehfil.zimdar_bhai_phone && (
                                    <p className="text-xs text-gray-500">
                                      Phone: {mehfil.zimdar_bhai_phone}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right ml-2 flex-shrink-0">
                              <span className="inline-flex items-center gap-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-medium">
                                ⚠ Pending
                              </span>

                              {mehfil.last_report !== "Never" ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last: {mehfil.last_report}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 mt-1">
                                  Never submitted
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      All mehfils have submitted reports!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KarkunDashboardPage;

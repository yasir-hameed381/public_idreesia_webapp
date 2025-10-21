"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminUsersService } from "@/services/AdminUser/admin-user-service";

interface UserData {
  id: number;
  zone_id: number | null;
  name: string;
  email: string;
  is_zone_admin: boolean;
  is_mehfil_admin: boolean;
  is_super_admin: boolean;
  user_type: string;
}

interface DashboardStats {
  totalKarkuns: number;
  ehadKarkuns: number;
  loading: boolean;
}

const KarkunDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalKarkuns: 0,
    ehadKarkuns: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        // Fetch all users data
        const response = await AdminUsersService.getAll({
          page: 1,
          size: 1000, // Fetch a large number to get all users
          search: "",
        });

        if (response?.data) {
          // Calculate Karkuns (excluding admins)
          const karkuns = response.data.filter(
            (user: UserData) =>
              !user.is_zone_admin &&
              !user.is_mehfil_admin &&
              (user.user_type === "karkun" || !user.user_type)
          );

          // Calculate Ehad Karkuns
          const ehadKarkuns = response.data.filter(
            (user: UserData) =>
              user.user_type === "ehad_karkun" ||
              user.user_type === "ehad-karkun"
          );

          setStats({
            totalKarkuns: karkuns.length,
            ehadKarkuns: ehadKarkuns.length,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const renderNavigationCards = () => (
    <div className="mx-auto px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-green-700 font-medium justify-center">
        <Link
          href="/karkun-portal/dashboard"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-green-600 text-white"
        >
          Dashboard
        </Link>
        <Link
          href="/karkun-portal/karkunan"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Karkunan
        </Link>
        <Link
          href="/karkun-portal/mehfil-reports"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Reports
        </Link>
        <Link
          href="/karkun-portal/new-ehad"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          New Ehad
        </Link>
        <Link
          href="/karkun-portal/tabarukats"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Tabarukat
        </Link>
        <Link
          href="/karkun-portal/attendance"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Karkunan Attendance
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {renderNavigationCards()}

        <hr className="border-gray-300 mb-6" />

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-green-800 mb-2">
                أستلام عَلَيْكُم وَرَحْمَةُ اللَّهِ وَتَرَكَّانَة
              </h2>
              <h3 className="text-lg text-gray-700">
                Welcome to Karkun Portal
              </h3>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded border border-green-200">
              <p className="text-sm text-gray-600">Zone</p>
              <p className="font-semibold text-green-800">Multan Zone</p>
              <p className="text-sm text-gray-600">Multan, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Karkuns */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Total Karkuns
            </h3>
            {stats.loading ? (
              <div className="flex justify-center items-center h-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalKarkuns}
              </p>
            )}
          </div>

          {/* Ehad Karkuns */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Ehad Karkuns
            </h3>
            {stats.loading ? (
              <div className="flex justify-center items-center h-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-green-600">
                {stats.ehadKarkuns}
              </p>
            )}
          </div>

          {/* New Ehads */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              New Ehads
            </h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-xs text-gray-500 mt-1">September 2025</p>
          </div>

          {/* Tabarukats */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-orange-500">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Tabarukats
            </h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
            <p className="text-xs text-gray-500 mt-1">September 2025</p>
          </div>
        </div>

        {/* Report Submission Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-gray-700 mb-2">
                © Please submit your monthly report for September 2025.
              </p>
            </div>
            <Link href="/karkun-portal/mehfil-reports/submit">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition duration-200">
                Submit Report
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarkunDashboardPage;

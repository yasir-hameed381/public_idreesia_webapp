"use client";

import React from "react";
import Link from "next/link";
import { TabarukatTable } from "@/app/[locale]/(admin)/components/Tabarukats/tabarukat-table";

const TabarukatsPage = () => {
  // Navigation Cards Component
  const renderNavigationCards = () => (
    <div className="mx-auto px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-green-700 font-medium justify-center">
        <Link
          href="/karkun-portal/dashboard"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
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
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-green-600 text-white"
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

        {/* Zone Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tabarukats
              </h2>
              <p className="text-gray-600">View and create tabarukat entries</p>
              <div className="mt-2 inline-flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  ✓ Create Allowed
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                  ✗ Update/Delete Restricted
                </span>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded border border-green-200">
              <p className="text-sm text-gray-600">Zone</p>
              <p className="font-semibold text-green-800">Multan Zone</p>
              <p className="text-sm text-gray-600">Multan, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Tabarukats Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <TabarukatTable
              onView={(tabarukat) => console.log("View tabarukat", tabarukat)}
              onAdd={() => console.log("Add tabarukat")}
              onEdit={(tabarukat) => console.log("Edit tabarukat", tabarukat)}
              hideEdit={true}
              hideDelete={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabarukatsPage;

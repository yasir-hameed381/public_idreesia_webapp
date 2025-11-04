"use client";

import React from "react";
import Link from "next/link";
import { TabarukatTable } from "@/app/[locale]/(admin)/components/Tabarukats/tabarukat-table";
import { useAuth } from "@/hooks/useAuth";

const TabarukatsPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
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
            {/* User Zone Context */}
            {user?.zone && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Your Zone
                </p>
                <p className="font-semibold text-gray-900">
                  {user.zone.title_en}
                </p>
                {user.zone.city_en && (
                  <p className="text-sm text-gray-600">
                    {user.zone.city_en}
                    {user.zone.country_en && `, ${user.zone.country_en}`}
                  </p>
                )}
              </div>
            )}
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

"use client";

import React from "react";
import Link from "next/link";
import { KarkunanTable } from "@/app/[locale]/(admin)/components/Karkuns/karkunan-table";
import { useRouter } from "next/navigation";

const KarkunanPage = () => {
  const router = useRouter();
  const handleAdd = () => {
    // Clear any existing session data before navigating
    sessionStorage.removeItem("editRow");
    router.push("/karkun-portal/karkunan/new");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Zone Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Karkuns</h2>
              <p className="text-gray-600">Manage Karkun accounts</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded border border-green-200">
              <p className="text-sm text-gray-600">Zone</p>
              <p className="font-semibold text-green-800">Multan Zone</p>
              <p className="text-sm text-gray-600">Multan, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Karkunan Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <KarkunanTable onEdit={() => {}} onAdd={handleAdd} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarkunanPage;

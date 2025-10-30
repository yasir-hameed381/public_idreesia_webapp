"use client";

import React from "react";
import Link from "next/link";
import { NewEhadTable } from "@/app/[locale]/(admin)/components/NewEhads/new-ehad-table";

const NewEhadPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Zone Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                New Ehads
              </h2>
              <p className="text-gray-600">View and manage new ehad entries</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded border border-green-200">
              <p className="text-sm text-gray-600">Zone</p>
              <p className="font-semibold text-green-800">Multan Zone</p>
              <p className="text-sm text-gray-600">Multan, Pakistan</p>
            </div>
          </div>
        </div>

        {/* New Ehads Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <NewEhadTable
              onView={(newEhad) => console.log("View new ehad", newEhad)}
              onAdd={() => console.log("Add new ehad")}
              onEdit={(newEhad) => console.log("Edit new ehad", newEhad)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEhadPage;

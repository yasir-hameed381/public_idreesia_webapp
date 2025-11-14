"use client";

import React from "react";
import Link from "next/link";

import KhatForm from "@/components/Khat/KhatForm";

const AdminNewKhatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
          <Link href="/admin/khatoot" className="text-sm text-green-600 hover:text-green-700">
            ← Back to Khat List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Khat / Masail</h1>
          <p className="text-gray-600">
            Submit a new khat or masail request with complete assignment information.
          </p>
        </div>

        <KhatForm variant="admin" redirectPath="/admin/khatoot" defaultType="khat" />
      </div>
    </div>
  );
};

export default AdminNewKhatPage;



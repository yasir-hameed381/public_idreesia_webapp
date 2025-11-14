"use client";

import React from "react";
import Link from "next/link";

import KhatForm from "@/components/Khat/KhatForm";

const KarkunPortalNewKhatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-2">
          <Link href="/karkun-portal/khatoot" className="text-sm text-green-600 hover:text-green-700">
            ← Back to Khat List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Submit Masail</h1>
          <p className="text-gray-600">
            Provide detailed information so the admin team can review your masail submission.
          </p>
        </div>

        <KhatForm variant="karkun" redirectPath="/karkun-portal/khatoot" defaultType="masail" />
      </div>
    </div>
  );
};

export default KarkunPortalNewKhatPage;



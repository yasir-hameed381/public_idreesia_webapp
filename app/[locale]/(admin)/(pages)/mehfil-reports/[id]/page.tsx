"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MehfilReportDetails } from "../../../components/MehfilReports/mehfil-report-details";

export default function MehfilReportDetailsPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [fallbackData, setFallbackData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("viewReportData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFallbackData(parsedData);
        } catch (error) {
          console.error("Error parsing fallback data:", error);
        }
      }
    }
  }, []);

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Report ID not found
            </div>
            <p className="text-gray-600 mt-2">
              Please check the URL and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <MehfilReportDetails reportId={reportId} reportData={fallbackData} />;
}

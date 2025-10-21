"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MehfilReportsTable } from "../../components/MehfilReports/mehfil-reports-table";

export default function MehfilReportsPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push("/mehfil-reports/new");
  };

  const handleView = (report: any) => {
    // Store report data in sessionStorage as fallback
    if (typeof window !== "undefined") {
      sessionStorage.setItem("viewReportData", JSON.stringify(report));
    }
    router.push(`/mehfil-reports/${report.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MehfilReportsTable onView={handleView} onAdd={handleAdd} />
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MehfilReportsForm } from "../../../components/MehfilReports/mehfil-reports-form";

export default function UpdateMehfilReportPage() {
  const router = useRouter();
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("editRow");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setEditData(parsedData);
        } catch (error) {
          console.error("Error parsing edit data:", error);
          router.push("/mehfil-reports");
        }
      } else {
        router.push("/mehfil-reports");
      }
    }
  }, [router]);

  const handleCancel = () => {
    router.push("/mehfil-reports");
  };

  const handleSuccess = () => {
    router.push("/mehfil-reports");
  };

  if (!editData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MehfilReportsForm
        editData={editData}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

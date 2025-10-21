"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MehfilReportsForm } from "../../../components/MehfilReports/mehfil-reports-form";

export default function NewMehfilReportPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/mehfil-reports");
  };

  const handleSuccess = () => {
    router.push("/mehfil-reports");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MehfilReportsForm
        editData={null}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ParhaiyanDetails } from "../../../components/Parhaiyan/Parhaiyan-details";
import { useGetParhaiyanByIdQuery } from "@/store/slicers/parhaiyanApi";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

function isFetchBaseQueryError(error: any): error is FetchBaseQueryError {
  return error && typeof error === "object" && "data" in error;
}

export default function ParhaiyanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const parhaiyanId = params.id as string;
  const [parhaiyanData, setParhaiyanData] = useState<Parhaiyan | null>(null);

  // Fetch parhaiyan data by ID
  const {
    data: parhaiyanResponse,
    isLoading,
    isError,
    error,
  } = useGetParhaiyanByIdQuery(parhaiyanId, {
    skip: !parhaiyanId || parhaiyanId === "new",
  });

  useEffect(() => {
    if (parhaiyanResponse?.data) {
      setParhaiyanData(parhaiyanResponse.data);
    }
  }, [parhaiyanResponse]);

  const handleClose = () => {
    router.push("/Parhaiyan");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parhaiyan details...</p>
        </div>
      </div>
    );
  }

  if (isError || !parhaiyanData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              {isError
                ? "Error loading Parhaiyan details"
                : "Parhaiyan not found"}
            </div>
            <p className="text-gray-600 mt-2">
              {(error &&
                isFetchBaseQueryError(error) &&
                (error.data as any)?.message) ||
                "The requested parhaiyan could not be found"}
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Back to Parhaiyan List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ParhaiyanDetails parhaiyan={parhaiyanData} onClose={handleClose} />;
}

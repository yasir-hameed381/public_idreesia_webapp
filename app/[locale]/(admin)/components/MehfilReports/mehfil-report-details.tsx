"use client";
import { useFetchMehfilReportQuery } from "../../../../../store/slicers/mehfilReportsApi";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Users,
  TrendingUp,
  UserCheck,
  Activity,
  Clock,
} from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect } from "react";

interface MehfilReportDetailsProps {
  reportId: string;
  reportData?: any; // Fallback data if API fails
}

export function MehfilReportDetails({
  reportId,
  reportData,
}: MehfilReportDetailsProps) {
  const router = useRouter();
  const {
    data: report,
    isLoading,
    error,
    isError,
    refetch,
  } = useFetchMehfilReportQuery(reportId);

  // Use fallback data if API fails
  const finalReport = report || reportData;

  // Debug logging (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Report ID:", reportId);
      console.log("Loading:", isLoading);
      console.log("Error:", error);
      console.log("Is Error:", isError);
      console.log("Report Data:", report);
      console.log("Report Data (fallback):", reportData);
      console.log("Final Report:", finalReport);
    }
  }, [reportId, isLoading, error, isError, report, reportData, finalReport]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

  // If we have fallback data, use it even if API fails
  if (finalReport) {
    // Continue to render the report details
  } else if (isError || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading report details
            </div>
            <p className="text-gray-600 mt-2">
              The API endpoint for individual reports is not available.
              {reportData
                ? " Using cached data instead."
                : " Please check your backend implementation."}
            </p>
            <p className="text-sm text-gray-500 mt-2">Report ID: {reportId}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => router.push("/mehfil-reports")}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !finalReport) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-yellow-500 text-lg font-medium">
              Report not found
            </div>
            <p className="text-gray-600 mt-2">
              The report with ID "{reportId}" could not be found.
            </p>
            <button
              onClick={() => router.push("/mehfil-reports")}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/mehfil-reports")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Mehfil Report Details
          </h1>
          {/* Show notice if using fallback data */}
          {!report && reportData && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Individual report API is not available.
                Showing cached data from the reports list.
              </p>
            </div>
          )}
        </div>

        {/* Report Information Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Period
                </label>
                <p className="text-lg text-gray-900">
                  {finalReport.report_period}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <p className="text-lg text-gray-900">
                  {finalReport.zone?.title_en}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitted At
                </label>
                <p className="text-lg text-gray-900">
                  {new Date(finalReport.submitted_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mehfil
                </label>
                <p className="text-lg text-gray-900">
                  #{finalReport.mehfil?.mehfil_number} -{" "}
                  {finalReport.mehfil?.address_en}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinator Information Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Coordinator Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordinator Name
                </label>
                <p className="text-lg text-gray-900">
                  {finalReport.coordinator?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Attendance (Days)
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {finalReport.coordinator?.attendance_days}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Karkun Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Karkun Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Duty Karkuns
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {finalReport.karkun_stats?.total_duty_karkuns ??
                    "Not Available"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistently Absent
                </label>
                <p className="text-2xl font-bold text-red-600">
                  {finalReport.karkun_stats?.low_attendance ?? "Not Available"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multan Duty Karkuns
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {finalReport.karkun_stats?.total_duty_karkuns -
                    finalReport.karkun_stats?.low_attendance}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Below 50% Attendance
                </label>
                <p className="text-2xl font-bold text-red-600">
                  {finalReport.karkun_stats?.low_attendance}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ehad Karkun Monthly Attendance (Days)
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {finalReport.coordinator?.attendance_days}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taleemat-e-Karima Read This Month
                </label>
                <p className="text-lg text-green-600 font-medium">Yes</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Ehads This Month
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {finalReport.karkun_stats?.new_ehads}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sawari and Bhangra Held
                </label>
                <p className="text-lg text-green-600 font-medium">Yes</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mehfil Days This Month
                </label>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Monthly Attendance (Days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Karkuns Attendance
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  {finalReport.coordinator?.attendance_days}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam Mubarak Meeting Attendance
                </label>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Main Mehfil Attendance
                </label>
                <p className="text-2xl font-bold text-gray-900">150</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  All Karkuns Meeting Attendance
                </label>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mashwara Meeting Details Card */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mashwara Meeting Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date
                </label>
                <p className="text-lg text-gray-900">Jun 27, 2025</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participant Karkuns
                </label>
                <p className="text-2xl font-bold text-gray-900">25</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Agenda Details
                </label>
                <p className="text-lg text-gray-900">abc</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ehad Karkun Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Ehad Karkun
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-lg text-gray-900">
                  {finalReport.ehad_karkun?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name
                </label>
                <p className="text-lg text-gray-900">N/A</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-lg text-gray-900">
                  marshadmib1166@gmail.com
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-lg text-gray-900">03004540381</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

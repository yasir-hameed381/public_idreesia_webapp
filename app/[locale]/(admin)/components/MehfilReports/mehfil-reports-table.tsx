"use client";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useFetchMehfilReportsQuery,
  useDeleteMehfilReportMutation,
} from "../../../../../store/slicers/mehfilReportsApi";
import { useFetchZonesQuery } from "../../../../../store/slicers/zoneApi";
import { usePagination } from "@/hooks/useTablePagination";
import { useToast } from "@/hooks/useToast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { useFetchMehfilsDataQuery } from "@/store/slicers/mehfilApi";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Download,
} from "lucide-react";

interface MehfilReportsTableProps {
  onView: (data: any) => void;
  onAdd: () => void;
}

export function MehfilReportsTable({ onView, onAdd }: MehfilReportsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const dispatch = useDispatch();
  const [selectedMehfil, setSelectedMehfil] = useState("");
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch mehfil directories for filter
  const { data: mehfilData } = useFetchMehfilsDataQuery({
    page: 1,
    size: 1000,
    search: "",
  });

  // Use the pagination hook
  const { pagination, handlePageChange, getFirstRowIndex } = usePagination({
    initialPerPage: 10,
    searchValue: debouncedSearch,
  });

  // Fetch zones for filter
  const { data: zonesData } = useFetchZonesQuery({ per_page: 1000 });

  // Helper function to format report period
  const formatReportPeriod = (month: number, year: number) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  // Helper function to format submitted date
  const formatSubmittedDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch data with pagination and search parameters
  const { data, isLoading, error } = useFetchMehfilReportsQuery({
    page: pagination.page,
    size: pagination.per_page,
    search: debouncedSearch,
    zone: selectedZone,
    month: selectedMonth,
    year: selectedYear,
  });

  const [deleteReport] = useDeleteMehfilReportMutation();

  const handleDelete = async () => {
    if (!selectedReport) return;

    try {
      await deleteReport(selectedReport.id).unwrap();
      showSuccess("Report deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedReport(null);
    } catch {
      showError("Failed to delete report.");
    }
  };

  const confirmDelete = (report: any) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const exportToExcel = () => {
    if (!data?.data || data.data.length === 0) {
      showError("No data available to export");
      return;
    }

    try {
      // Prepare data for export
      const exportData = data.data.map((report: any, index: number) => {
        const zoneData = zonesData?.data?.find(
          (zone: any) => zone.id === report.zone_id
        );
        return {
          "S.No": index + 1,
          "Report Period": formatReportPeriod(
            report.report_month,
            report.report_year
          ),
          "Zone (English)": zoneData?.title_en || `Zone ${report.zone_id}`,
          "Zone (Urdu)": zoneData?.title_ur || "",
          "Mehfil ID": report.mehfile_directory_id,
          "Coordinator ID": report.coordinator_name,
          "Coordinator Attendance Days":
            report.coordinator_monthly_attendance_days,
          "Total Duty Karkuns": report.total_duty_karkuns,
          "Low Attendance Karkuns": report.attendance_below_50_percent_karkuns,
          "Consistently Absent": report.consistently_absent_karkuns,
          "New Ehads": report.new_ehads_in_months,
          "Ehad Karkun ID": report.ehad_karkun_id,
          "Ehad Karkun Attendance Days":
            report.ehad_karkuns_monthly_attendance_days,
          "Submitted At": formatSubmittedDate(report.created_at),
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 }, // S.No
        { wch: 15 }, // Report Period
        { wch: 20 }, // Zone (English)
        { wch: 20 }, // Zone (Urdu)
        { wch: 12 }, // Mehfil ID
        { wch: 15 }, // Coordinator ID
        { wch: 20 }, // Coordinator Attendance Days
        { wch: 20 }, // Total Duty Karkuns
        { wch: 20 }, // Low Attendance Karkuns
        { wch: 18 }, // Consistently Absent
        { wch: 12 }, // New Ehads
        { wch: 15 }, // Ehad Karkun ID
        { wch: 25 }, // Ehad Karkun Attendance Days
        { wch: 20 }, // Submitted At
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Mehfil Reports");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `mehfil-reports-${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      showSuccess("Report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      showError("Failed to export report. Please try again.");
    }
  };

  // Custom pagination handler for the table
  const handleTablePageChange = (newPage: number) => {
    handlePageChange({
      first: (newPage - 1) * pagination.per_page,
      rows: pagination.per_page,
    });
  };

  const totalPages = Math.ceil((data?.meta?.total || 0) / pagination.per_page);
  const currentPage = pagination.page;
  const startRecord = getFirstRowIndex() + 1;
  const endRecord = Math.min(
    startRecord + pagination.per_page - 1,
    data?.meta?.total || 0
  );

  // Generate months and years for filters
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              Error loading Mehfil Reports data
            </div>
            <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mehfil Reports
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage mehfil reports
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
              >
                <Download size={16} />
                Export
              </button>
              {/* Add & View Report Button */}
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Add & View Report
              </button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 sm:p-6">
            {/* Line 1: Search + Zone + Mehfil */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Zones</option>
                  {zonesData?.data?.map((zone: any) => (
                    <option key={zone.id} value={zone.title_en}>
                      {zone.title_en}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-0">
                <select
                  value={selectedMehfil}
                  onChange={(e) => setSelectedMehfil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Mehfil</option>
                  {mehfilData?.data?.map((mehfil: any) => (
                    <option key={mehfil.id} value={mehfil.title_en}>
                      {mehfil.title_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line 2: Month + Year + Records Per Page */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-0">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-shrink-0">
                <select
                  value={pagination.per_page}
                  onChange={(e) =>
                    handlePageChange({
                      first: 0,
                      rows: parseInt(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[80px]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mehfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Karkun Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ehad Karkun
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FileText className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Data not Found kindly update it
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first mehfil report.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data?.data?.map((report: any) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatReportPeriod(
                                report.report_month,
                                report.report_year
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zonesData?.data?.find(
                                (zone: any) => zone.id === report.zone_id
                              )?.title_en || `Zone ${report.zone_id}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {zonesData?.data?.find(
                                (zone: any) => zone.id === report.zone_id
                              )?.title_ur || ""}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Mehfil #{report.mehfile_directory_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Coordinator {report.coordinator_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.coordinator_monthly_attendance_days} days
                              attendance
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 space-y-1">
                              <div>
                                Total Duty Karkuns: {report.total_duty_karkuns}
                              </div>
                              <div>
                                Low Attendance:{" "}
                                {report.attendance_below_50_percent_karkuns}
                              </div>
                              <div>
                                Consistently Absent:{" "}
                                {report.consistently_absent_karkuns}
                              </div>
                              <div>New Ehads: {report.new_ehads_in_months}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Ehad Karkun {report.ehad_karkun_id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.ehad_karkuns_monthly_attendance_days} days
                              attendance
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatSubmittedDate(report.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative dropdown-container">
                              <button
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                title="More options"
                                onClick={() => {
                                  setOpenDropdown(
                                    openDropdown === report.id
                                      ? null
                                      : report.id
                                  );
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {openDropdown === report.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        onView(report);
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Eye size={16} />
                                      View
                                    </button>
                                    <button
                                      onClick={() => {
                                        confirmDelete(report);
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data?.data && data.data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of{" "}
                      {data?.meta?.total || 0} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTablePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleTablePageChange(pageNum)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  currentPage === pageNum
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handleTablePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Report
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this report? This will permanently
              remove the report from the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

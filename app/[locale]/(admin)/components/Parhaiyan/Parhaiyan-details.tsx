"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  BookOpen,
  FileText,
  Download as DownloadIcon,
  Trash2,
} from "lucide-react";

interface ParhaiyanDetailsProps {
  parhaiyan: Parhaiyan;
  onClose: () => void;
}

interface RecitationData {
  id: number;
  name: string;
  father_name: string;
  city: string;
  mobile_number: string;
  darood_ibrahimi: number;
  qul_shareef: number;
  yaseen_shareef: number;
  quran_pak: number;
  submitted_at: string;
}

interface CumulativeStats {
  darood_ibrahimi: number;
  qul_shareef: number;
  yaseen_shareef: number;
  quran_pak: number;
  total_participants: number;
}

export function ParhaiyanDetails({
  parhaiyan,
  onClose,
}: ParhaiyanDetailsProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [recitations, setRecitations] = useState<RecitationData[]>([]);
  const [stats, setStats] = useState<CumulativeStats>({
    darood_ibrahimi: 0,
    qul_shareef: 0,
    yaseen_shareef: 0,
    quran_pak: 0,
    total_participants: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    const mockRecitations: RecitationData[] = [
      {
        id: 840,
        name: "Wasim Iqbal",
        father_name: "Shouket Hussain",
        city: "Lalamusa",
        mobile_number: "3313811611",
        darood_ibrahimi: 100,
        qul_shareef: 100,
        yaseen_shareef: 5,
        quran_pak: 4,
        submitted_at: "2025-03-27T22:59:00Z",
      },
      {
        id: 839,
        name: "Ahmed Ali",
        father_name: "Muhammad Hassan",
        city: "Lahore",
        mobile_number: "3312345678",
        darood_ibrahimi: 150,
        qul_shareef: 120,
        yaseen_shareef: 8,
        quran_pak: 6,
        submitted_at: "2025-03-27T22:45:00Z",
      },
      // Add more mock data as needed
    ];

    const mockStats: CumulativeStats = {
      darood_ibrahimi: 121463212,
      qul_shareef: 48758063,
      yaseen_shareef: 33125,
      quran_pak: 1830,
      total_participants: 389,
    };

    setRecitations(mockRecitations);
    setStats(mockStats);
    setLoading(false);
  }, [parhaiyan.id]);

  const filteredRecitations = recitations.filter(
    (recitation) =>
      recitation.name.toLowerCase().includes(search.toLowerCase()) ||
      recitation.father_name.toLowerCase().includes(search.toLowerCase()) ||
      recitation.city.toLowerCase().includes(search.toLowerCase()) ||
      recitation.mobile_number.includes(search)
  );

  const totalPages = Math.ceil(filteredRecitations.length / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(
    startRecord + perPage - 1,
    filteredRecitations.length
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    // Implement CSV export functionality
    console.log("Exporting CSV...");
  };

  const handleViewPublicForm = () => {
    // Implement public form view
    console.log("Viewing public form...");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy - h:mm a");
  };

  const formatDateRange = (
    startDate: string | Date | undefined,
    endDate: string | Date | undefined
  ) => {
    if (!startDate || !endDate) return "N/A";
    const start = format(
      startDate instanceof Date ? startDate : new Date(startDate),
      "MMM dd, yyyy"
    );
    const end = format(
      endDate instanceof Date ? endDate : new Date(endDate),
      "MMM dd, yyyy"
    );
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parhaiyan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {parhaiyan.title_en}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    parhaiyan.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {parhaiyan.is_active ? "Active" : "Inactive"}
                </span>
                <span>
                  {formatDateRange(parhaiyan.start_date, parhaiyan.end_date)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewPublicForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Eye size={16} />
                View Public Form
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <DownloadIcon size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Cumulative Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Cumulative Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium">Darood Ibrahimi</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {stats.darood_ibrahimi.toLocaleString()}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium">Qul Shareef</p>
                  <p className="text-2xl font-bold text-green-800">
                    {stats.qul_shareef.toLocaleString()}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 font-medium">Yaseen Shareef</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {stats.yaseen_shareef.toLocaleString()}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 font-medium">Quran Pak</p>
                  <p className="text-2xl font-bold text-red-800">
                    {stats.quran_pak.toLocaleString()}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-semibold">Total Participants:</span>{" "}
              {stats.total_participants}
            </p>
          </div>
        </div>

        {/* Recitations Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recitations
            </h2>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search recitations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Records Per Page Control */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) =>
                      handlePerPageChange(Number(e.target.value))
                    }
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FATHER'S NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CITY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOBILE NUMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DAROOD IBRAHIMI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUL SHAREEF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    YASEEN SHAREEF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QURAN PAK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUBMITTED AT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecitations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No recitations found
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecitations
                    .slice((currentPage - 1) * perPage, currentPage * perPage)
                    .map((recitation) => (
                      <tr key={recitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {recitation.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.father_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.city}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.mobile_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.darood_ibrahimi}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.qul_shareef}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.yaseen_shareef}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recitation.quran_pak}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(recitation.submitted_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecitations.length > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startRecord} to {endRecord} of{" "}
                  {filteredRecitations.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            currentPage === pageNum
                              ? "bg-gray-900 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

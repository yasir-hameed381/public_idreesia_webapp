"use client";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  BookOpen,
  FileText,
  Download as DownloadIcon,
  Trash2,
} from "lucide-react";
import {
  useGetParhaiyanRecitationsQuery,
  useDeleteRecitationMutation,
} from "@/store/slicers/parhaiyanApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";

interface ParhaiyanDetailsProps {
  parhaiyan: Parhaiyan;
  onClose: () => void;
}

interface RecitationData {
  id: number;
  parhaiyan_id: number;
  name: string;
  father_name: string;
  city: string;
  mobile_number: string;
  darood_ibrahimi: number;
  qul_shareef: number;
  yaseen_shareef: number;
  quran_pak: number;
  created_at: string;
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
  const [sortField, setSortField] = useState<"id" | "name" | "father_name" | "city" | "mobile_number" | "darood_ibrahimi" | "qul_shareef" | "yaseen_shareef" | "quran_pak" | "created_at">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  // Fetch recitations from API
  const parhaiyanId = typeof parhaiyan.id === 'number' ? parhaiyan.id : parseInt(String(parhaiyan.id || 0), 10);
  
  const {
    data: recitationsData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetParhaiyanRecitationsQuery({
    parhaiyan_id: parhaiyanId,
    page: 1,
    size: 10000, // Fetch all to calculate stats and for client-side pagination/search
    search: debouncedSearch,
  });

  const [deleteRecitation, { isLoading: isDeleting }] = useDeleteRecitationMutation();

  // Filter recitations by search (API handles parhaiyan_id filtering)
  const filteredRecitations = useMemo(() => {
    if (!recitationsData?.data) return [];
    
    let filtered = [...recitationsData.data];

    // Apply additional client-side search filter if needed (API already does basic search)
    if (debouncedSearch) {
      filtered = filtered.filter(
        (recitation) =>
          recitation.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          recitation.father_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          recitation.city?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          recitation.mobile_number?.includes(debouncedSearch)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (sortField === "id") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (sortField === "created_at") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [recitationsData?.data, parhaiyan.id, debouncedSearch, sortField, sortDirection]);

  // Calculate cumulative stats from all recitations (API already filters by parhaiyan_id)
  const stats = useMemo(() => {
    if (!recitationsData?.data || recitationsData.data.length === 0) {
      return {
        darood_ibrahimi: 0,
        qul_shareef: 0,
        yaseen_shareef: 0,
        quran_pak: 0,
        total_participants: 0,
      };
    }

    return {
      darood_ibrahimi: recitationsData.data.reduce(
        (sum, r) => sum + (r.darood_ibrahimi || 0),
        0
      ),
      qul_shareef: recitationsData.data.reduce(
        (sum, r) => sum + (r.qul_shareef || 0),
        0
      ),
      yaseen_shareef: recitationsData.data.reduce(
        (sum, r) => sum + (r.yaseen_shareef || 0),
        0
      ),
      quran_pak: recitationsData.data.reduce(
        (sum, r) => sum + (r.quran_pak || 0),
        0
      ),
      total_participants: recitationsData.data.length,
    };
  }, [recitationsData?.data]);

  // Handle sort change
  const handleSortChange = (field: "id" | "name" | "father_name" | "city" | "mobile_number" | "darood_ibrahimi" | "qul_shareef" | "yaseen_shareef" | "quran_pak" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "created_at" ? "desc" : "asc");
    }
  };

  // Handle row selection
  const selectRow = (id: number) => {
    setSelectedRowId(id);
  };

  // Check if row is selected
  const isSelected = (id: number) => {
    return selectedRowId === id;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, id: number, index: number, total: number) => {
    if (event.key === "ArrowDown" && index < total - 1) {
      event.preventDefault();
      const nextRow = document.getElementById(`recitation-row-${index + 1}`);
      if (nextRow) {
        nextRow.focus();
        const nextId = parseInt(nextRow.dataset.id || "0");
        selectRow(nextId);
      }
    } else if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      const prevRow = document.getElementById(`recitation-row-${index - 1}`);
      if (prevRow) {
        prevRow.focus();
        const prevId = parseInt(prevRow.dataset.id || "0");
        selectRow(prevId);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recitation? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteRecitation(id).unwrap();
      showSuccess("Recitation deleted successfully");
      refetch();
    } catch (error: any) {
      showError(error?.data?.message || "Failed to delete recitation");
    }
  };

  // Pagination
  const paginatedRecitations = filteredRecitations.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const totalPages = Math.ceil(filteredRecitations.length / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(
    startRecord + perPage - 1,
    filteredRecitations.length
  );

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDirection]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Name",
      "Father's Name",
      "City",
      "Mobile Number",
      "Darood Ibrahimi",
      "Qul Shareef",
      "Yaseen Shareef",
      "Quran Pak",
      "Submitted At",
    ];
    const rows = filteredRecitations.map((r) => [
      r.id,
      r.name,
      r.father_name,
      r.city,
      r.mobile_number,
      r.darood_ibrahimi,
      r.qul_shareef,
      r.yaseen_shareef,
      r.quran_pak,
      format(new Date(r.created_at), "dd MMM yyyy - h:mm a"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `parhaiyan-${parhaiyan.id}-recitations.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("CSV exported successfully");
  };

  const handleViewPublicForm = () => {
    // Navigate to public form
    const urlSlug = parhaiyan.url_slug;
    if (urlSlug) {
      // Store parhaiyan data in sessionStorage as fallback
      sessionStorage.setItem(
        "currentParhaiyanData",
        JSON.stringify(parhaiyan)
      );
      // Open in new tab - route will be /[locale]/parhaiyan/[slug]
      const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';
      window.open(`/${locale}/parhaiyan/${urlSlug}`, "_blank");
    } else {
      showError("Public form URL not available. Please ensure the parhaiyan has a URL slug.");
    }
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

  // Show error notification
  useEffect(() => {
    if (error) {
      showError("Failed to load recitations. Please try again.");
    }
  }, [error]);

  const loading = isLoading || isFetching;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-[#6bb179] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading parhaiyan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {parhaiyan.title_en}
                </h1>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    parhaiyan.is_active
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {parhaiyan.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateRange(parhaiyan.start_date, parhaiyan.end_date)}
              </p>
            </div>
            <div className="flex flex-row gap-2">
              <button
                onClick={handleViewPublicForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                <Eye size={16} />
                View Public Form
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                <DownloadIcon size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Cumulative Stats */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Cumulative Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                    Darood Ibrahimi
                  </div>
                  <div className="text-blue-700 dark:text-blue-200 text-3xl font-bold mt-2">
                    {stats.darood_ibrahimi.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-green-600 dark:text-green-300 text-sm font-medium">
                    Qul Shareef
                  </div>
                  <div className="text-green-700 dark:text-green-200 text-3xl font-bold mt-2">
                    {stats.qul_shareef.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-amber-600 dark:text-amber-300 text-sm font-medium">
                    Yaseen Shareef
                  </div>
                  <div className="text-amber-700 dark:text-amber-200 text-3xl font-bold mt-2">
                    {stats.yaseen_shareef.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-red-600 dark:text-red-300 text-sm font-medium">
                    Quran Pak
                  </div>
                  <div className="text-red-700 dark:text-red-200 text-3xl font-bold mt-2">
                    {stats.quran_pak.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Participants: <span className="font-bold">{stats.total_participants}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Recitations Section */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recitations
        </h2>

        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search recitations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("id")}
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      {sortField === "id" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("name")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      {sortField === "name" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("father_name")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Father's Name</span>
                      {sortField === "father_name" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("city")}
                  >
                    <div className="flex items-center gap-1">
                      <span>City</span>
                      {sortField === "city" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("mobile_number")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Mobile Number</span>
                      {sortField === "mobile_number" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("darood_ibrahimi")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Darood Ibrahimi</span>
                      {sortField === "darood_ibrahimi" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("qul_shareef")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Qul Shareef</span>
                      {sortField === "qul_shareef" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("yaseen_shareef")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Yaseen Shareef</span>
                      {sortField === "yaseen_shareef" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("quran_pak")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Quran Pak</span>
                      {sortField === "quran_pak" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleSortChange("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Submitted At</span>
                      {sortField === "created_at" && (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedRecitations.length === 0 ? (
                  <tr className="focus:outline-none">
                    <td colSpan={11} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      No recitations have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  paginatedRecitations.map((recitation, index) => (
                    <tr
                      key={recitation.id}
                      id={`recitation-row-${index}`}
                      data-id={recitation.id}
                      tabIndex={0}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150 ease-in-out cursor-pointer ${
                        isSelected(recitation.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={() => selectRow(recitation.id)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, recitation.id, index, paginatedRecitations.length)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {recitation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {recitation.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {recitation.father_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {recitation.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {recitation.mobile_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                        {recitation.darood_ibrahimi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                        {recitation.qul_shareef}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                        {recitation.yaseen_shareef}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                        {recitation.quran_pak}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(recitation.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(recitation.id);
                          }}
                          disabled={isDeleting}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
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
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {startRecord} to {endRecord} of{" "}
                  {filteredRecitations.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              ? "bg-gray-900 dark:bg-[#6bb179] text-white"
                              : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

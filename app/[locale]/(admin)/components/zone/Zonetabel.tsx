"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  FileText,
} from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import { PERMISSIONS } from "@/types/permission";
import { usePagination } from "@/hooks/useTablePagination";
import {
  useDeletezoneMutation,
  useFetchZonesQuery,
} from "../../../../../store/slicers/zoneApi";
import { ZoneTableProps } from "../../../../types/Zone";
import { useDebounce } from "@/hooks/useDebounce";
import jsPDF from "jspdf";
import ActionsDropdown from "@/components/ActionsDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

export function ZoneTable({ onEdit, onAdd }: ZoneTableProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [search, setSearch] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState<"id" | "title_en" | "created_at">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { showError, showSuccess } = useToast();
  const { hasPermission, isSuperAdmin, user } = usePermissions();

  // Debug logging for zone permissions
  console.log("🔍 Zone Table Permission Debug:", {
    isSuperAdmin,
    hasViewZones: hasPermission(PERMISSIONS.VIEW_ZONES),
    hasCreateZones: hasPermission(PERMISSIONS.CREATE_ZONES),
    hasEditZones: hasPermission(PERMISSIONS.EDIT_ZONES),
    hasDeleteZones: hasPermission(PERMISSIONS.DELETE_ZONES),
    userRole: user?.role?.name,
    userPermissions: user?.role?.permissions?.map((p) => p.name) || [],
    zonePermissions: [
      PERMISSIONS.VIEW_ZONES,
      PERMISSIONS.CREATE_ZONES,
      PERMISSIONS.EDIT_ZONES,
      PERMISSIONS.DELETE_ZONES,
    ],
  });

  // Fetch data with pagination and search parameters
  const {
    data: zoneData,
    isLoading,
    error,
    isFetching,
  } = useFetchZonesQuery({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch,
  });

  const [deleteZone, { isLoading: isDeleting }] = useDeletezoneMutation();

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortField, sortDirection]);

  const handleSortChange = (field: "id" | "title_en" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Client-side sorting since API doesn't support it yet
  const getSortedData = (data: any[]) => {
    if (!data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";
      
      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison (for ID)
      if (sortField === "id") {
        const aNum = parseInt(aValue);
        const bNum = parseInt(bValue);
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      
      // Handle date comparison
      if (sortField === "created_at") {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
      
      // Convert to string and compare
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const handleDeleteClick = (zone: any) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_ZONES))) {
      showError("You don't have permission to delete zones");
      return;
    }
    setSelectedZone(zone);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedZone) return;

    try {
      setDeleting(true);
      await deleteZone(selectedZone.id).unwrap();
      showSuccess("Zone deleted successfully.");
      setShowDeleteDialog(false);
      setSelectedZone(null);
    } catch (error) {
      showError("Failed to delete zone.");
      console.error("Error deleting zone:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (zone: any) => {
    if (!(isSuperAdmin || hasPermission(PERMISSIONS.EDIT_ZONES))) {
      showError("You don't have permission to edit zones");
      return;
    }
    if (onEdit) {
      onEdit(zone.id);
    } else {
      router.push(`/${locale}/zone/${zone.id}`);
    }
  };

  const handleView = (zone: any) => {
    router.push(`/${locale}/zone/${zone.id}`);
  };

  const handleTablePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const handleExportPDF = async (zone: any) => {
    try {
      // Create new PDF document
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fix the background image path - use relative path from public directory
      const backgroundImagePath = "/background2.png"; // Place image in public folder

      // Create a promise to load the image
      const loadImage = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
              }
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } catch (error) {
              reject(error);
            }
          };
          img.onerror = (error) => {
            reject(new Error(`Failed to load image: ${src}`));
          };
          img.src = src;
        });
      };

      // Add Urdu font support (you'll need to add the font file to your public directory)
      // For now, we'll use helvetica as fallback and add proper Urdu support
      try {
        // If you have a custom Urdu font file, load it here
        // doc.addFont('/path/to/urdu-font.ttf', 'urdu-font', 'normal');
      } catch (fontError) {
        console.warn("Custom Urdu font not available, using system font");
      }

      // Load and add background image
      let hasBackground = false;
      try {
        const backgroundBase64 = await loadImage(backgroundImagePath);
        doc.addImage(backgroundBase64, "PNG", 0, 0, pageWidth, pageHeight);
        hasBackground = true;
      } catch (imageError) {
        console.warn(
          "Could not load background image, creating custom design:",
          imageError
        );

        // Create a beautiful certificate background without external image
        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Decorative border
        doc.setDrawColor(218, 165, 32); // Gold color
        doc.setLineWidth(3);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        // Inner border
        doc.setDrawColor(34, 139, 34); // Forest green
        doc.setLineWidth(1);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Header section with green background
        doc.setFillColor(34, 139, 34);
        doc.rect(10, 10, pageWidth - 20, 40, "F");

        // Decorative corners
        const cornerSize = 15;
        doc.setFillColor(218, 165, 32);
        // Top corners
        doc.circle(15, 15, 3, "F");
        doc.circle(pageWidth - 15, 15, 3, "F");
        // Bottom corners
        doc.circle(15, pageHeight - 15, 3, "F");
        doc.circle(pageWidth - 15, pageHeight - 15, 3, "F");
      }

      // Helper function to safely set text color
      const safeSetTextColor = (r: number, g: number, b: number) => {
        try {
          doc.setTextColor(r, g, b);
        } catch (error) {
          console.warn("Color setting failed, using black:", error);
          doc.setTextColor(0, 0, 0);
        }
      };

      // Helper function to add Urdu/Arabic text
      const addUrduText = (
        text: string,
        x: number,
        y: number,
        options: any = {}
      ) => {
        try {
          doc.setFont("helvetica", options.style || "normal");
          doc.setFontSize(options.fontSize || 12);

          if (options.color) {
            if (Array.isArray(options.color) && options.color.length === 3) {
              safeSetTextColor(
                options.color[0],
                options.color[1],
                options.color[2]
              );
            } else {
              safeSetTextColor(0, 0, 0);
            }
          }

          // For better Urdu display, reverse the text if needed
          const displayText = options.reverse
            ? text.split("").reverse().join("")
            : text;

          doc.text(displayText, x, y, {
            align: options.align || "center",
            ...options,
          });
        } catch (error) {
          console.warn("Error adding Urdu text:", error);
        }
      };

      // Helper function to add English text
      const addEnglishText = (
        text: string,
        x: number,
        y: number,
        options: any = {}
      ) => {
        try {
          doc.setFont("helvetica", options.style || "normal");
          doc.setFontSize(options.fontSize || 12);

          if (options.color) {
            if (Array.isArray(options.color) && options.color.length === 3) {
              safeSetTextColor(
                options.color[0],
                options.color[1],
                options.color[2]
              );
            } else {
              safeSetTextColor(0, 0, 0);
            }
          }

          const maxWidth = options.maxWidth || pageWidth - 40;
          const lines = doc.splitTextToSize(text, maxWidth);
          doc.text(lines, x, y, {
            align: options.align || "center",
            ...options,
          });
          return y + lines.length * ((options.fontSize || 12) * 0.35);
        } catch (error) {
          console.warn("Error adding English text:", error);
          return y;
        }
      };

      let yPosition = hasBackground ? 70 : 60;

      // Header section
      if (hasBackground) {
        safeSetTextColor(255, 255, 255); // White for background image
      } else {
        safeSetTextColor(255, 255, 255); // White for green header
      }

      // Main Arabic/Urdu title
      addUrduText(
        "سلسلہ محمدیہ امینیہ ادریسیہ",
        pageWidth / 2,
        hasBackground ? 30 : 25,
        {
          fontSize: 18,
          style: "bold",
          align: "center",
          color: hasBackground ? [255, 255, 255] : [255, 255, 255],
        }
      );

      // English subtitle
      addEnglishText(
        "Silsila Muhammadiyah Aminiyah Idreesiyah",
        pageWidth / 2,
        hasBackground ? 42 : 37,
        {
          fontSize: 12,
          style: "normal",
          align: "center",
          color: hasBackground ? [255, 255, 255] : [255, 255, 255],
        }
      );

      yPosition = hasBackground ? 70 : 65;

      // Certificate title
      safeSetTextColor(34, 139, 34); // Dark green
      addEnglishText("Zone Information Certificate", pageWidth / 2, yPosition, {
        fontSize: 16,
        style: "bold",
        align: "center",
        color: [34, 139, 34],
      });
      yPosition += 15;

      // Zone title in both languages
      addEnglishText(zone.title_en || "Zone Title", pageWidth / 2, yPosition, {
        fontSize: 14,
        style: "bold",
        align: "center",
        color: [34, 139, 34],
      });
      yPosition += 8;

      addUrduText(zone.title_ur || "زون ٹائٹل", pageWidth / 2, yPosition, {
        fontSize: 12,
        align: "center",
        color: [34, 139, 34],
      });
      yPosition += 20;

      // Information section
      const boxX = 25;
      const boxWidth = pageWidth - 50;
      const boxY = yPosition;

      // Main info box
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(1);
      doc.rect(boxX, boxY, boxWidth, 45, "FD");

      // Add information inside the box
      yPosition = boxY + 8;
      safeSetTextColor(0, 0, 0);

      // Zone details
      addEnglishText(`Zone ID: ${zone.id}`, boxX + 5, yPosition, {
        fontSize: 10,
        align: "left",
        color: [0, 0, 0],
      });

      addEnglishText(
        `Date: ${zone.created_at ? formatDate(zone.created_at) : "N/A"}`,
        pageWidth - boxX - 5,
        yPosition,
        {
          fontSize: 10,
          align: "right",
          color: [0, 0, 0],
        }
      );
      yPosition += 7;

      // Location information
      addEnglishText(
        `Country: ${zone.country_en || "N/A"}`,
        boxX + 5,
        yPosition,
        {
          fontSize: 10,
          align: "left",
          maxWidth: boxWidth / 2 - 10,
          color: [0, 0, 0],
        }
      );

      addUrduText(
        `ملک: ${zone.country_ur || "غیر دستیاب"}`,
        pageWidth - boxX - 5,
        yPosition,
        {
          fontSize: 10,
          align: "right",
          color: [0, 0, 0],
        }
      );
      yPosition += 7;

      addEnglishText(`City: ${zone.city_en || "N/A"}`, boxX + 5, yPosition, {
        fontSize: 10,
        align: "left",
        maxWidth: boxWidth / 2 - 10,
        color: [0, 0, 0],
      });

      addUrduText(
        `شہر: ${zone.city_ur || "غیر دستیاب"}`,
        pageWidth - boxX - 5,
        yPosition,
        {
          fontSize: 10,
          align: "right",
          color: [0, 0, 0],
        }
      );
      yPosition += 7;

      // CEO information
      if (zone.co) {
        addEnglishText(`CEO: ${zone.co}`, boxX + 5, yPosition, {
          fontSize: 10,
          align: "left",
          color: [0, 0, 0],
        });
        yPosition += 7;
      }

      yPosition = boxY + 50;

      // Contact information
      if (zone.primary_phone_number || zone.secondary_phone_number) {
        addEnglishText("Contact Information", pageWidth / 2, yPosition, {
          fontSize: 12,
          style: "bold",
          align: "center",
          color: [34, 139, 34],
        });
        yPosition += 8;

        const contactY = yPosition;
        doc.setFillColor(240, 248, 255);
        doc.rect(boxX, contactY, boxWidth, 20, "F");

        yPosition = contactY + 6;

        if (zone.primary_phone_number) {
          addEnglishText(
            `Primary: ${zone.primary_phone_number}`,
            boxX + 5,
            yPosition,
            {
              fontSize: 10,
              align: "left",
              color: [0, 0, 0],
            }
          );
        }

        if (zone.secondary_phone_number) {
          addEnglishText(
            `Secondary: ${zone.secondary_phone_number}`,
            pageWidth - boxX - 5,
            yPosition,
            {
              fontSize: 10,
              align: "right",
              color: [0, 0, 0],
            }
          );
        }

        yPosition = contactY + 25;
      }

      // Description
      if (zone.description) {
        addEnglishText("Description", pageWidth / 2, yPosition, {
          fontSize: 12,
          style: "bold",
          align: "center",
          color: [34, 139, 34],
        });
        yPosition += 8;

        yPosition = addEnglishText(zone.description, pageWidth / 2, yPosition, {
          fontSize: 10,
          align: "center",
          maxWidth: boxWidth - 20,
          color: [0, 0, 0],
        });
        yPosition += 10;
      }

      // Footer
      const footerY = pageHeight - 25;
      addEnglishText(
        `Certificate Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        footerY,
        {
          fontSize: 8,
          align: "center",
          color: [100, 100, 100],
        }
      );

      addEnglishText("www.idreesia.com", pageWidth / 2, footerY + 6, {
        fontSize: 8,
        align: "center",
        color: [34, 139, 34],
      });

      // Save the PDF
      const fileName = `zone-certificate-${(zone.title_en || "zone")
        .replace(/\s+/g, "-")
        .toLowerCase()}-${zone.id}.pdf`;

      doc.save(fileName);

      showSuccess("Zone certificate exported successfully!");
    } catch (error) {
      showError("Failed to export zone certificate.");
      console.error("Error exporting PDF:", error);
    }
  };

  // Helper function to format date
  // const formatDate = (date: string | undefined) => {
  //   if (!date) return "N/A";
  //   return new Date(date).toLocaleDateString("en-GB", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //   });
  // };

  // Format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return (
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " - " +
      new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const totalPages = Math.ceil((zoneData?.meta?.total || 0) / perPage);
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(
    startRecord + perPage - 1,
    zoneData?.meta?.total || 0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zones</h1>
              <p className="text-gray-600 mt-1">
                Manage zone information and locations
              </p>
            </div>
            {(isSuperAdmin || hasPermission(PERMISSIONS.CREATE_ZONES)) && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {/* <Plus size={16} /> */}
                Create Zone
              </button>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by title, country, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {search.trim() && (
                <div className="mt-2 text-sm text-gray-600">
                  Searching for: "{search}" • Found{" "}
                  {zoneData?.data?.length || 0} results
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="text-gray-600">Loading zones...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("id")}
                      >
                        <div className="flex items-center gap-2">
                          <span>ID</span>
                          {sortField === "id" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("title_en")}
                      >
                        <div className="flex items-center gap-2">
                          <span>Title</span>
                          {sortField === "title_en" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Primary Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Secondary Phone
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange("created_at")}
                      >
                        <div className="flex items-center gap-2">
                          <span>Created At</span>
                          {sortField === "created_at" && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              {sortDirection === "asc" ? (
                                <path d="M10 5l-5 6h10l-5-6z" />
                              ) : (
                                <path d="M10 15l5-6H5l5 6z" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zoneData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No zones found
                            </h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getSortedData(zoneData?.data || []).map((zone: any) => (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {zone.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm text-gray-900">
                                {zone.title_en}
                              </div>
                              <div
                                className="text-xs text-gray-500 text-right"
                                dir="rtl"
                              >
                                {zone.title_ur}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {zone.description || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm text-gray-900">
                                {zone.country_en}
                              </div>
                              <div
                                className="text-xs text-gray-500 text-right"
                                dir="rtl"
                              >
                                {zone.country_ur}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm text-gray-900">
                                {zone.city_en}
                              </div>
                              <div
                                className="text-xs text-gray-500 text-right"
                                dir="rtl"
                              >
                                {zone.city_ur}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zone.co || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zone.primary_phone_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zone.secondary_phone_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(zone.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleExportPDF(zone)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Export PDF"
                              >
                                <FileText size={16} />
                              </button>
                              <ActionsDropdown
                                onView={() => handleView(zone)}
                                onEdit={() => handleEdit(zone)}
                                onDelete={(isSuperAdmin || hasPermission(PERMISSIONS.DELETE_ZONES)) ? () => handleDeleteClick(zone) : undefined}
                                showView={true}
                                showEdit={isSuperAdmin || hasPermission(PERMISSIONS.EDIT_ZONES)}
                                showDelete={isSuperAdmin || hasPermission(PERMISSIONS.DELETE_ZONES)}
                                align="right"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {zoneData?.data && zoneData.data.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startRecord} to {endRecord} of{" "}
                      {zoneData?.meta?.total || 0} results
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

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Zone"
          message={`Are you sure you want to delete "${selectedZone?.title_en}"? This action cannot be undone.`}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedZone(null);
          }}
          onConfirm={handleDelete}
          isLoading={deleting}
        />
      </div>
    </div>
  );
}

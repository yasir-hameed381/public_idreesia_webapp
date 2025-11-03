"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DutyRoster {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  zone_id?: number;
  zone?: {
    id: number;
    title_en: string;
    city_en?: string;
  };
  mehfil_directory_id?: number;
  mehfil?: {
    id: number;
    name_en: string;
    mehfil_number?: string;
  };
  duty_type_id_monday?: number;
  duty_type_id_tuesday?: number;
  duty_type_id_wednesday?: number;
  duty_type_id_thursday?: number;
  duty_type_id_friday?: number;
  duty_type_id_saturday?: number;
  duty_type_id_sunday?: number;
}

interface DutyType {
  id: number;
  name: string;
  zone_id: number;
}

export default function DutyRosterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRosters();
    fetchDutyTypes();
  }, [currentPage, searchTerm]);

  const fetchRosters = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: 10,
        search: searchTerm,
      };

      // Add zone filtering based on user permissions
      if (user?.zone_id && !user?.is_super_admin && !user?.is_region_admin) {
        params.zone_id = user.zone_id;
      }

      if (user?.mehfil_directory_id && user?.is_mehfil_admin) {
        params.mehfil_directory_id = user.mehfil_directory_id;
      }

      const response = await axios.get(`${API_URL}/duty-rosters-data`, {
        params,
      });
      setRosters(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch duty rosters");
      console.error("Error fetching rosters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDutyTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-types-data/active`);
      setDutyTypes(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch duty types");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this duty roster?")) {
      try {
        await axios.delete(`${API_URL}/duty-rosters-data/${id}`);
        toast.success("Duty roster deleted successfully!");
        fetchRosters();
      } catch (error) {
        toast.error("Failed to delete duty roster");
      }
    }
  };

  const getDutyTypeName = (id?: number) => {
    if (!id) return "-";
    const dutyType = dutyTypes.find((dt) => dt.id === id);
    return dutyType?.name || `ID: ${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Duty Roster Management
                </h1>
                <p className="text-gray-600 text-sm">
                  View and manage karkun duty assignments
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/karkun-portal/dutyRoster/new")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusCircle size={20} />
              Add Duty Roster
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search duty rosters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Table with Weekly View */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Karkun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mehfil
                  </th>
                  {DAY_LABELS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={11} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && rosters.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No duty rosters found</p>
                      <button
                        onClick={() =>
                          router.push("/karkun-portal/dutyRoster/new")
                        }
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create First Roster
                      </button>
                    </td>
                  </tr>
                )}
                {!loading &&
                  rosters.map((roster) => (
                    <tr
                      key={roster.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {roster.user?.name || `User #${roster.user_id}`}
                          </div>
                          {roster.user?.email && (
                            <div className="text-xs text-gray-500">
                              {roster.user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {roster.zone_id || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {roster.mehfil_directory_id
                          ? `#${roster.mehfil_directory_id}`
                          : "-"}
                      </td>
                      {DAYS.map((day) => {
                        const dutyTypeId = roster[
                          `duty_type_id_${day}` as keyof DutyRoster
                        ] as number | undefined;
                        return (
                          <td
                            key={day}
                            className="px-4 py-3 text-center text-sm"
                          >
                            {dutyTypeId ? (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {getDutyTypeName(dutyTypeId)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/karkun-portal/dutyRoster/${roster.id}`
                              )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(roster.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, PlusCircle, Pencil, Trash2 } from "lucide-react";
import axios from "axios";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface DutyType {
  id: number;
  name: string;
  zone_id: number;
}

interface DutyAssignment {
  id: number;
  duty_type_id: number;
  duty_type: DutyType;
  mehfil?: MehfilDirectory;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en?: string;
  address_en?: string;
}

interface DutyRoster {
  roster_id?: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    father_name?: string;
    phone_number?: string;
    email?: string;
  };
  mehfil_directory_id?: number;
  mehfil_directory?: MehfilDirectory;
  duties: Record<(typeof DAYS)[number], DutyAssignment[]>;
}

export default function DutyRosterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRosters();
  }, []);

  const fetchRosters = async () => {
    setLoading(true);
    try {
      // Simple fetch - no filters applied (matching admin version)
      const response = await apiClient.get("/duty-rosters-data");
      
      const rostersData = response.data.data || [];
      console.log("[Karkun Portal] Fetched rosters:", rostersData);
      
      setRosters(rostersData);
    } catch (error) {
      toast.error("Failed to fetch duty rosters");
      console.error("Error fetching rosters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this duty roster?")) {
      try {
      await apiClient.delete(`/duty-rosters-data/${id}`);
        toast.success("Duty roster deleted successfully!");
        fetchRosters();
      } catch (error) {
        toast.error("Failed to delete duty roster");
      }
    }
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
                    Mehfil
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                    >
                      {DAY_LABELS[day]}
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
                      key={roster.roster_id ?? roster.user_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {roster.user?.name || `User #${roster.user_id}`}
                          </div>
                          {roster.user?.father_name && (
                            <div className="text-xs text-gray-500">
                              Son of {roster.user.father_name}
                            </div>
                          )}
                          {roster.user?.phone_number && (
                            <div className="text-xs text-gray-500">
                              {roster.user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {roster.mehfil_directory?.mehfil_number
                          ? `#${roster.mehfil_directory.mehfil_number}`
                          : "-"}
                        {roster.mehfil_directory?.name_en && (
                          <div className="text-xs text-gray-500">
                            {roster.mehfil_directory.name_en}
                          </div>
                        )}
                      </td>
                      {DAYS.map((day) => {
                        const assignments = roster.duties?.[day] ?? [];
                        return (
                          <td
                            key={day}
                            className="px-4 py-3 text-center text-sm"
                          >
                            <div className="space-y-1">
                              {assignments.length === 0 && (
                                <span className="text-gray-400">-</span>
                              )}
                              {assignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-1"
                                >
                                  {assignment.duty_type?.name || assignment.duty_type_id || "Duty"}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/karkun-portal/dutyRoster/${roster.roster_id}`
                              )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(roster.roster_id!)}
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


      </div>
    </div>
  );
}

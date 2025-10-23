"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/";

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

interface MehfilCoordinator {
  id: number;
  mehfil_directory_id: number;
  user_id: number;
  coordinator_type: string;
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
}

export default function CoordinatorsPage() {
  const router = useRouter();
  const [coordinators, setCoordinators] = useState<MehfilCoordinator[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCoordinators();
    fetchDutyTypes();
  }, [currentPage, searchTerm]);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/mehfil-coordinators`, {
        params: { page: currentPage, size: 10, search: searchTerm },
      });
      setCoordinators(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch coordinators");
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
    if (confirm("Are you sure you want to delete this coordinator?")) {
      try {
        await axios.delete(`${API_URL}/mehfil-coordinators/${id}`);
        toast.success("Coordinator deleted successfully!");
        fetchCoordinators();
      } catch (error) {
        toast.error("Failed to delete coordinator");
      }
    }
  };

  const getDutyTypeName = (id?: number) => {
    if (!id) return "-";
    const dutyType = dutyTypes.find((dt) => dt.id === id);
    return dutyType?.name || `ID: ${id}`;
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_COORDINATORS}>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users /> Mehfil Coordinators
          </h1>
          <Button
            onClick={() => router.push("/coordinators/new")}
            className="flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Coordinator
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search coordinators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mehfil Directory</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                {DAY_LABELS.map((day) => (
                  <TableHead key={day} className="text-center min-w-[100px]">
                    {day.substring(0, 3)}
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && coordinators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    No coordinators found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                coordinators.map((coordinator) => (
                  <TableRow key={coordinator.id}>
                    <TableCell>{coordinator.id}</TableCell>
                    <TableCell>{coordinator.mehfil_directory_id}</TableCell>
                    <TableCell className="font-medium">
                      {coordinator.user_id}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs capitalize">
                        {coordinator.coordinator_type}
                      </span>
                    </TableCell>
                    {DAYS.map((day) => {
                      const dutyTypeId = coordinator[
                        `duty_type_id_${day}` as keyof MehfilCoordinator
                      ] as number | undefined;
                      return (
                        <TableCell key={day} className="text-center text-xs">
                          {dutyTypeId ? (
                            <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                              {getDutyTypeName(dutyTypeId)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/coordinators/${coordinator.id}`)
                          }
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(coordinator.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </PermissionWrapper>
  );
}

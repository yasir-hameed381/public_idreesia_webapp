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
import { PlusCircle, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/";

interface DutyType {
  id: number;
  zone_id: number;
  name: string;
  description?: string;
  is_editable: boolean;
  is_hidden: boolean;
}

export default function DutyTypesPage() {
  const router = useRouter();
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDutyTypes();
  }, [currentPage, searchTerm]);

  const fetchDutyTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/duty-types-data`, {
        params: { page: currentPage, size: 10, search: searchTerm },
      });
      setDutyTypes(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch duty types");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this duty type?")) {
      try {
        await axios.delete(`${API_URL}/duty-types-data/${id}`);
        toast.success("Duty type deleted successfully!");
        fetchDutyTypes();
      } catch (error) {
        toast.error("Failed to delete duty type");
      }
    }
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_DUTY_TYPES}>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Duty Types Management</h1>
          <Button
            onClick={() => router.push("/duty-types/new")}
            className="flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Duty Type
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search duty types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Zone ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && dutyTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No duty types found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                dutyTypes.map((dutyType) => (
                  <TableRow key={dutyType.id}>
                    <TableCell>{dutyType.id}</TableCell>
                    <TableCell>{dutyType.zone_id}</TableCell>
                    <TableCell className="font-medium">
                      {dutyType.name}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {dutyType.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {dutyType.is_hidden ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
                            <EyeOff size={12} /> Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-200 text-green-700">
                            <Eye size={12} /> Visible
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {dutyType.is_editable ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/duty-types/${dutyType.id}`)
                              }
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(dutyType.id!)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            Not Editable
                          </span>
                        )}
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

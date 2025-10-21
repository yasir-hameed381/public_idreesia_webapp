"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DutyRoster {
  id: number;
  user_id: number;
  zone_id?: number;
  mehfil_directory_id?: number;
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
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRosters();
    fetchDutyTypes();
  }, [currentPage, searchTerm]);

  const fetchRosters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/duty-rosters-data`, {
        params: { page: currentPage, size: 10, search: searchTerm },
      });
      setRosters(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch duty rosters');
    } finally {
      setLoading(false);
    }
  };

  const fetchDutyTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-types-data/active`);
      setDutyTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch duty types');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this duty roster?')) {
      try {
        await axios.delete(`${API_URL}/duty-rosters-data/${id}`);
        toast.success('Duty roster deleted successfully!');
        fetchRosters();
      } catch (error) {
        toast.error('Failed to delete duty roster');
      }
    }
  };

  const getDutyTypeName = (id?: number) => {
    if (!id) return '-';
    const dutyType = dutyTypes.find((dt) => dt.id === id);
    return dutyType?.name || `ID: ${id}`;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar /> Duty Roster Management
        </h1>
        <Button onClick={() => router.push('/duty-roster/new')} className="flex items-center gap-2">
          <PlusCircle size={20} />
          Add Duty Roster
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search duty rosters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table with Weekly View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Mehfil</TableHead>
              {DAY_LABELS.map((day) => (
                <TableHead key={day} className="text-center min-w-[120px]">
                  {day}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && rosters.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  No duty rosters found
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rosters.map((roster) => (
                <TableRow key={roster.id}>
                  <TableCell className="font-medium">{roster.user_id}</TableCell>
                  <TableCell>{roster.zone_id || '-'}</TableCell>
                  <TableCell>{roster.mehfil_directory_id || '-'}</TableCell>
                  {DAYS.map((day) => {
                    const dutyTypeId = roster[`duty_type_id_${day}` as keyof DutyRoster] as number | undefined;
                    return (
                      <TableCell key={day} className="text-center text-sm">
                        {dutyTypeId ? (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
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
                        onClick={() => router.push(`/duty-roster/${roster.id}`)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(roster.id)}
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
  );
}


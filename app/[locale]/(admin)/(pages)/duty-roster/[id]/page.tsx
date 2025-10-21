"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DutyType {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  title_en: string;
  title_ur: string;
  city_en?: string;
  country_en?: string;
}

interface MehfilDirectory {
  id: number;
  name_en: string;
  name_ur: string;
  city_en?: string;
  mehfil_number?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

export default function EditDutyRosterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<any>({
    user_id: '',
    zone_id: '',
    mehfil_directory_id: '',
  });

  useEffect(() => {
    fetchDutyTypes();
    fetchZones();
    fetchMehfilDirectories();
    fetchUsers();
    fetchDutyRoster();
  }, [id]);

  const fetchDutyTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-types-data/active`);
      setDutyTypes(response.data.data || []);
      console.log('Duty types loaded:', response.data.data);
    } catch (error) {
      console.error('Failed to fetch duty types:', error);
      toast.error('Failed to fetch duty types');
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${API_URL}/zone?page=1&size=1000`);
      setZones(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const fetchMehfilDirectories = async () => {
    try {
      const response = await axios.get(`${API_URL}/mehfil-directory?page=1&size=1000`);
      setMehfilDirectories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch mehfil directories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/adminUsers?page=1&size=1000`);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchDutyRoster = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-rosters-data/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch duty roster');
      router.push('/duty-roster');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_URL}/duty-rosters-data/update/${id}`, formData);
      toast.success('Duty roster updated successfully!');
      router.push('/duty-roster');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update duty roster';
      toast.error(errorMessage);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Duty Roster</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update weekly duty assignments for user
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="user_id">User *</Label>
                  <Select
                    value={formData.user_id?.toString() || 'select'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        user_id: value !== 'select' ? parseInt(value) : '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select a user...</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} {user.email && `(${user.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zone_id">Zone (Optional)</Label>
                  <Select
                    value={formData.zone_id?.toString() || 'none'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        zone_id: value !== 'none' ? parseInt(value) : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.title_en} {zone.city_en && `- ${zone.city_en}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mehfil_directory_id">Mehfil Directory (Optional)</Label>
                  <Select
                    value={formData.mehfil_directory_id?.toString() || 'none'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        mehfil_directory_id: value !== 'none' ? parseInt(value) : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mehfil directory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {mehfilDirectories.map((md) => (
                        <SelectItem key={md.id} value={md.id.toString()}>
                          {md.mehfil_number && `#${md.mehfil_number} - `}
                          {md.name_en}
                          {md.city_en && ` - ${md.city_en}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Weekly Duty Assignments */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Weekly Duty Assignments</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Assign a duty type for each day of the week
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS.map((day, index) => (
                  <div key={day} className="grid gap-2">
                    <Label htmlFor={day}>{DAY_LABELS[index]}</Label>
                    <Select
                      value={formData[`duty_type_id_${day}`]?.toString() || 'none'}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          [`duty_type_id_${day}`]: value !== 'none' ? parseInt(value) : undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duty type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {dutyTypes.map((dt) => (
                          <SelectItem key={dt.id} value={dt.id.toString()}>
                            {dt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t">
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? 'Creating...' : 'Create Roster'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


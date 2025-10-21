"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DutyType {
  id: number;
  name: string;
}

interface MehfilDirectory {
  id: number;
  name_en: string;
  name_ur: string;
  address_en?: string;
  address_ur?: string;
  city_en?: string;
  mehfil_number?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

export default function NewCoordinatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<any>({
    mehfil_directory_id: '',
    user_id: '',
    coordinator_type: 'main',
  });

  useEffect(() => {
    fetchDutyTypes();
    fetchMehfilDirectories();
    fetchUsers();
  }, []);

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

  const fetchMehfilDirectories = async () => {
    try {
      const response = await axios.get(`${API_URL}/mehfil-directory?page=1&size=1000`);
      setMehfilDirectories(response.data.data || []);
      console.log('Mehfil directories loaded:', response.data.data);
    } catch (error) {
      console.error('Failed to fetch mehfil directories:', error);
      toast.error('Failed to fetch mehfil directories');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/adminUsers?page=1&size=1000`);
      setUsers(response.data.data || []);
      console.log('Users loaded:', response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that mehfil directory is selected
    if (!formData.mehfil_directory_id || formData.mehfil_directory_id === 'select') {
      toast.error('Please select a mehfil directory');
      return;
    }

    if (!formData.user_id || formData.user_id === 'select') {
      toast.error('Please select a user');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        mehfil_directory_id: parseInt(formData.mehfil_directory_id),
        user_id: parseInt(formData.user_id),
      };

      await axios.post(`${API_URL}/mehfil-coordinators/add`, payload);
      toast.success('Coordinator created successfully!');
      router.push('/coordinators');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create coordinator';
      toast.error(errorMessage);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Create New Coordinator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Assign a coordinator to a mehfil with weekly duties
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
                  <Label htmlFor="mehfil_directory_id">Mehfil Directory *</Label>
                  <Select
                    value={formData.mehfil_directory_id?.toString() || 'select'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        mehfil_directory_id: value !== 'select' ? value : '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mehfil directory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select a mehfil directory...</SelectItem>
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

                <div className="grid gap-2">
                  <Label htmlFor="user_id">User *</Label>
                  <Select
                    value={formData.user_id?.toString() || 'select'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        user_id: value !== 'select' ? value : '',
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
                  <Label htmlFor="coordinator_type">Coordinator Type *</Label>
                  <Input
                    id="coordinator_type"
                    value={formData.coordinator_type}
                    onChange={(e) =>
                      setFormData({ ...formData, coordinator_type: e.target.value })
                    }
                    required
                    placeholder="e.g., main, assistant"
                  />
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
              {loading ? 'Creating...' : 'Create Coordinator'}
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


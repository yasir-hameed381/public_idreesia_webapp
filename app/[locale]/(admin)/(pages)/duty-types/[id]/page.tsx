"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

export default function EditDutyTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    zone_id: 1,
    name: '',
    description: '',
    is_editable: true,
    is_hidden: false,
  });

  useEffect(() => {
    fetchDutyType();
  }, [id]);

  const fetchDutyType = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-types-data/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch duty type');
      router.push('/duty-types');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API_URL}/duty-types-data/update/${id}`, formData);
      toast.success('Duty type updated successfully!');
      router.push('/duty-types');
    } catch (error) {
      toast.error('Failed to update duty type');
      console.error(error);
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
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Duty Type</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="zone_id">Zone ID *</Label>
              <Input
                id="zone_id"
                type="number"
                value={formData.zone_id}
                onChange={(e) =>
                  setFormData({ ...formData, zone_id: parseInt(e.target.value) })
                }
                required
                placeholder="Enter zone ID"
              />
              <p className="text-sm text-gray-500">The zone this duty type belongs to</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Duty Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Security Duty, Cleaning Duty"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Describe the responsibilities and requirements of this duty type"
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_editable"
                  checked={formData.is_editable}
                  onChange={(e) =>
                    setFormData({ ...formData, is_editable: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_editable" className="cursor-pointer">
                  Allow Editing
                </Label>
              </div>
              <p className="text-sm text-gray-500 -mt-3">
                If unchecked, this duty type cannot be edited or deleted
              </p>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={formData.is_hidden}
                  onChange={(e) =>
                    setFormData({ ...formData, is_hidden: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="is_hidden" className="cursor-pointer">
                  Hide from Lists
                </Label>
              </div>
              <p className="text-sm text-gray-500 -mt-3">
                If checked, this duty type will be hidden from dropdown lists
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? 'Updating...' : 'Update Duty Type'}
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


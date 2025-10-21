"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

export default function NewDutyTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    zone_id: 1,
    name: '',
    description: '',
    is_editable: true,
    is_hidden: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a duty type name');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/duty-types-data/add`, formData);
      toast.success('Duty type created successfully!');
      router.push('/duty-types');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create duty type';
      toast.error(errorMessage);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Create New Duty Type</h1>
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
                value={formData.description}
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
              {loading ? 'Creating...' : 'Create Duty Type'}
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


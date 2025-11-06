"use client";
import { useState } from "react";
import { RegionTable } from "@/app/[locale]/(admin)/components/Regions/region-table";
import { RegionForm } from "@/app/[locale]/(admin)/components/Regions/region-form";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import { Region } from "@/services/Region/region-service";

export default function RegionsPage() {
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingRegion(null);
  };

  const handleAdd = () => {
    setEditingRegion(null);
    setShowForm(true);
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRegion(null);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_REGIONS}>
      <div className="space-y-6">
        {showForm ? (
          <RegionForm
            onSuccess={handleSuccess}
            editingRegion={editingRegion}
            onCancel={handleCancel}
          />
        ) : (
          <RegionTable
            onAdd={handleAdd}
            onEdit={handleEdit}
            showActions={true}
          />
        )}
      </div>
    </PermissionWrapper>
  );
}


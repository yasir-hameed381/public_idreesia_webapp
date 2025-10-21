// app/[locale]/(admin)/pages/parhaiyan.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParhaiyanTable } from "../../components/Parhaiyan/Parhaiyan-tabel";
import { ParhaiyanForm } from "../../components/Parhaiyan/Parhaiyan-form";
import { Parhaiyan } from "@/app/types/Parhaiyan";

export default function ParhaiyanPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParhaiyan, setEditingParhaiyan] = useState<
    Parhaiyan | undefined
  >();
  const router = useRouter();

  const handleEdit = (parhaiyan: Parhaiyan) => {
    setEditingParhaiyan(parhaiyan);
    setIsFormOpen(true);
  };

  const handleView = (parhaiyan: Parhaiyan) => {
    // Navigate to the details page with the parhaiyan ID
    router.push(`/Parhaiyan/${parhaiyan.id}`);
  };

  const handleAdd = () => {
    setEditingParhaiyan(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingParhaiyan(undefined);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Parhaiyan Table Component */}
      <ParhaiyanTable
        onEdit={handleEdit}
        onAdd={handleAdd}
        onView={handleView}
      />

      {/* Parhaiyan Form Component - Only render when open */}
      {isFormOpen && (
        <ParhaiyanForm
          parhaiyan={editingParhaiyan}
          open={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

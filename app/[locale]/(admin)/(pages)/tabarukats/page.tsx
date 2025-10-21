"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TabarukatTable } from "../../components/Tabarukats/tabarukat-table";
import { TabarukatForm } from "../../components/Tabarukats/tabarukat-form";

export default function TabarukatsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleAdd = () => {
    setShowForm(true);
  };

  const handleEdit = (tabarukat: any) => {
    setEditData(tabarukat);
    setShowEditForm(true);
  };

  const handleView = (tabarukat: any) => {
    // Store tabarukat data in sessionStorage as fallback
    if (typeof window !== "undefined") {
      sessionStorage.setItem("viewTabarukatData", JSON.stringify(tabarukat));
    }
    router.push(`/tabarukats/${tabarukat.id}`);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setShowEditForm(false);
    setEditData(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowEditForm(false);
    setEditData(null);
  };

  if (showForm) {
    return <TabarukatForm onSuccess={handleSuccess} onCancel={handleCancel} />;
  }

  if (showEditForm) {
    return (
      <TabarukatForm
        editData={editData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TabarukatTable
        onEdit={handleEdit}
        onAdd={handleAdd}
        onView={handleView}
      />
    </div>
  );
}


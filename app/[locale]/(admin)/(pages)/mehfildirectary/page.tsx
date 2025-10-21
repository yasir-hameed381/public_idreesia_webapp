
"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { MehfilDirectoryTable } from "../../components/Mehfil-Directory/MehfilDirectory-tabel";

export default function MehfilDirectoryPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push('/mehfildirectary/new');
  };


  const handleEdit = (data: any) => {
    router.push(`/mehfildirectary/${data}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mehfil Directory</h1>
    
      </div>
      <MehfilDirectoryTable onEdit={handleEdit}  onAdd={handleAdd} />
    </div>
  );
}





"use client";
import { useState } from "react";
import { NamazTable } from "../../components/Namaz/Namaz-tabel";
import { Namazform } from "../../components/Namaz/Namaz-form";
// import "primereact/resources/themes/lara-light-indigo/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeicons/primeicons.css";

export default function NamazPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <NamazTable onAdd={handleAdd} />
     <Namazform onClose={handleFormClose} open={isFormOpen}/>
    </div>
  );
}
"use client";
import { EhadKarkunForm } from "../../../components/ehadKarkun/ehadkarkun-form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KarkunFormData } from "../../../../../types/Ehad-Karkun";
import { ProgressSpinner } from "primereact/progressspinner";

export default function EhadKarkunFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState<KarkunFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setEditData(null);
      setLoading(false);
    } else {
      const sessionData = sessionStorage.getItem("editRow");
      if (sessionData) {
        const karkun = JSON.parse(sessionData);
        console.log("session-data", karkun);
        setEditData(karkun);
      }
      setLoading(false);
    }
  }, [id]);

  const handleSuccess = () => {
    router.push("/ehadKarkun");
  };

  const handleCancel = () => {
    router.push("/ehadKarkun");
  };

  if (loading) {
    return (
       <div className="fixed inset-0  flex justify-center items-center  h-screen bg-[rgb(153,153,153)] bg-opacity-50  z-50">
        <ProgressSpinner style={{ width: "60px", height: "60px" }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EhadKarkunForm
        editData={editData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}













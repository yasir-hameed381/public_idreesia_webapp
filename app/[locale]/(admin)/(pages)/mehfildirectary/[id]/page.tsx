"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MehfilDirectoryForm } from "../../../components/Mehfil-Directory/Mehfil-directory-form";
import { ProgressSpinner } from "primereact/progressspinner";
// import your data fetching hook, e.g.:
import { useGetMehfilByIdQueryQuery } from "../../../../../../store/slicers/mehfildirectoryApi";

export default function MehfilFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState<any>(null);

  const { data, isLoading, isError } = useGetMehfilByIdQueryQuery(id as string, {
    skip: id === 'new'
  });

  useEffect(() => {
    if (data?.data) {
      setEditData(data.data);
    }
  }, [data]);

  const handleSuccess = () => {
    router.push('/mehfildirectary');
  };

  const handleCancel = () => {
    router.push('/mehfildirectary');
  };

  if (id !== 'new' && isLoading) {
    return <ProgressSpinner style={{ width: "50px", height: "50px" }} />;
  }

  if (id !== 'new' && isError) {
    return <div>Error loading Mehfil data.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MehfilDirectoryForm 
        editData={editData}
        // onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

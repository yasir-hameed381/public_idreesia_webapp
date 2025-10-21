"use client";
import { ZoneForm } from "../../../components/zone/Zoneform";
import { useParams, useRouter } from "next/navigation";
import { useGetZoneByIdQuery } from "@/store/slicers/zoneApi";
import { useEffect, useState } from "react";
import { ZoneFormData } from "../../../../../types/Zone";
import { ProgressSpinner } from "primereact/progressspinner";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function ZoneFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [editData, setEditData] = useState<ZoneFormData | null>(null);

  // Directly fetch the zone by ID
  const {
    data: zoneData,
    isLoading,
    isFetching,
    isError,
  } = useGetZoneByIdQuery(id as string, {
    skip: id === "new", // Skip the query if we're creating a new zone
  });

  useEffect(() => {
    if (zoneData?.data) {
      setEditData(zoneData.data);
    }
  }, [zoneData]);

  const handleSuccess = () => {
    router.push("/zone");
  };

  const handleCancel = () => {
    router.push("/zone");
  };

  if (id !== "new" && (isLoading || isFetching)) {
    return (
      <div>
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    );
  }

  if (id !== "new" && isError) {
    return <div>Error loading zone data</div>;
  }

  // Determine required permission based on action
  const requiredPermission = editData
    ? PERMISSIONS.EDIT_ZONES
    : PERMISSIONS.CREATE_ZONES;

  return (
    <PermissionWrapper requiredPermission={requiredPermission}>
      <div className="container mx-auto px-4 py-8">
        <ZoneForm
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </PermissionWrapper>
  );
}

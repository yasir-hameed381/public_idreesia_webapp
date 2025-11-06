"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RegionForm } from "@/app/[locale]/(admin)/components/Regions/region-form";
import { RegionService, Region } from "@/services/Region/region-service";
import { useToast } from "@/hooks/useToast";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";

export default function RegionEditPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const id = params.id as string;
        const regionData = await RegionService.getById(parseInt(id));
        setRegion(regionData);
      } catch (error: any) {
        showError(error.message || "Failed to load region");
        router.push("/regions");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRegion();
    }
  }, [params.id, router, showError]);

  const handleSuccess = () => {
    router.push("/regions");
  };

  const handleCancel = () => {
    router.push("/regions");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading region...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.EDIT_REGIONS}>
      <RegionForm
        onSuccess={handleSuccess}
        editingRegion={region}
        onCancel={handleCancel}
      />
    </PermissionWrapper>
  );
}


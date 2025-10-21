"use client";
import React, { useState, useEffect } from "react";
import WazaifTable from "../../components/Wazaif/wazaif-table";
import { Wazaif } from "../../../../types/wazif";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreateWazaifMutation,
  useDeleteWazaifMutation,
  useGetWazaifQuery,
  useUpdateWazaifMutation,
} from "@/store/slicers/wazaifApi";
import { useToast } from "@/hooks/useToast";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
const WazaifPage = () => {
  // State
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedWazaif, setSelectedWazaif] = useState<Wazaif | null>(null);

  const { showError, showSuccess } = useToast();

  // RTK Query hooks
  const {
    data: wazaifData,
    isLoading,
    error,
  } = useGetWazaifQuery({
    page: page + 1,
    size: pageSize,
    search: "",
  });

  const [createWazaif, { isLoading: isCreating }] = useCreateWazaifMutation();
  const [updateWazaif, { isLoading: isUpdating }] = useUpdateWazaifMutation();
  const [deleteWazaif, { isLoading: isDeleting }] = useDeleteWazaifMutation();

  // Helper functions
  const editWazaif = async (wazaif: Wazaif) => {
    try {
      if (wazaif.id) {
        // Update existing wazaif
        await updateWazaif(wazaif).unwrap();
        showSuccess("Wazaif Updated");
      } else {
        // Create new wazaif
        await createWazaif(wazaif).unwrap();
        showSuccess("Wazaif Created");
      }
    } catch (err: any) {
      console.error("Error saving wazaif:", err);
      showError(err?.data?.message || "Failed to save wazaif");
    }
  };

  const executeDelete = async (id: number) => {
    try {
      await deleteWazaif(id).unwrap();
      showSuccess("Wazaif Deleted");
    } catch (err) {
      showError("Failed to delete wazaif");
      console.error("Error deleting wazaif:", err);
    }
  };

  // Handle pagination
  const onPageChange = (event: any) => {
    setPage(event.page);
    setPageSize(event.rows);
  };

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_WAZAIFS}>
      <WazaifTable
        data={wazaifData}
        isLoading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onEdit={editWazaif}
        onDelete={executeDelete}
        isDeleting={isDeleting}
        selectedWazaif={selectedWazaif}
        onSelectionChange={setSelectedWazaif}
      />
    </PermissionWrapper>
  );
};

export default WazaifPage;

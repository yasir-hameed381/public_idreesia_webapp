"use client";
import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import {
  useUpdateNamazMutation,
  useGetNamazQuery,
  type Namaz,
} from "@/store/slicers/NamazApi";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/useTablePagination";
import { useToast } from "@/hooks/useToast";

interface NamazTableProps {
  onAdd: () => void;
}

const NAMAZ_TIMES = [
  { key: "fajr" as keyof Namaz, label: "Fajr", icon: "🌅" },
  { key: "dhuhr" as keyof Namaz, label: "Dhuhr", icon: "☀️" },
  { key: "asr" as keyof Namaz, label: "Asr", icon: "🌤️" },
  { key: "maghrib" as keyof Namaz, label: "Maghrib", icon: "🌆" },
  { key: "isha" as keyof Namaz, label: "Isha", icon: "🌙" },
  { key: "jumma" as keyof Namaz, label: "Jumma", icon: "🕌" },
];

export function NamazTable({ onAdd }: NamazTableProps) {
  const [search, setSearch] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Namaz | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const { pagination } = usePagination({
    initialPerPage: 10,
    searchValue: debouncedSearch,
  });

  const { showError, showSuccess } = useToast();

  const {
    data: paginatedNamazData,
    error,
    isLoading,
    isFetching,
  } = useGetNamazQuery({
    page: pagination.page,
    size: pagination.per_page,
    search: debouncedSearch,
  });

  const [updateNamaz, { isLoading: isUpdating }] = useUpdateNamazMutation();

  useEffect(() => {
    if (error) {
      showError("Failed to load namaz times. Please try again.");
    }
  }, [error]);

  const handleEditClick = (item: Namaz) => {
    setEditingItemId(item.id);
    // Convert HH:MM:SS to HH:MM for time inputs
    const formatTimeForInput = (time: string) => {
      if (!time || time.includes("منٹ")) return time; // Keep maghrib as is
      return time.substring(0, 5); // Extract HH:MM from HH:MM:SS
    };

    setEditFormData({
      ...item,
      fajr: formatTimeForInput(item.fajr),
      dhuhr: formatTimeForInput(item.dhuhr),
      asr: formatTimeForInput(item.asr),
      maghrib: item.maghrib, // Keep as is (text for maghrib)
      isha: formatTimeForInput(item.isha),
      jumma: formatTimeForInput(item.jumma),
    });
    setShowEditDialog(true);
  };

  const handleEditInputChange = (field: keyof Namaz, value: any) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      // Convert HH:MM to HH:MM:SS for API
      const formatTimeForAPI = (time: string) => {
        if (!time || time.includes("منٹ")) return time; // Keep maghrib text as is
        return time.length === 5 ? `${time}:00` : time; // Add :00 if only HH:MM
      };

      const updatePayload = {
        id: editFormData.id,
        data: {
          fajr: formatTimeForAPI(editFormData.fajr),
          dhuhr: formatTimeForAPI(editFormData.dhuhr),
          asr: formatTimeForAPI(editFormData.asr),
          maghrib: editFormData.maghrib,
          isha: formatTimeForAPI(editFormData.isha),
          jumma: formatTimeForAPI(editFormData.jumma),
          description_en: editFormData.description_en || null,
          description_ur: editFormData.description_ur || null,
        },
      };

      console.log("Update payload:", updatePayload);

      await updateNamaz(updatePayload).unwrap();

      showSuccess("Namaz times updated successfully.");
      setEditingItemId(null);
      setEditFormData(null);
      setShowEditDialog(false);
    } catch (err: any) {
      console.error("Failed to update namaz times:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to update namaz times. Please try again.";
      showError(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditFormData(null);
    setShowEditDialog(false);
  };

  const formatTimeToAMPM = (timeString: string) => {
    // Handle text values like "غروب آفتاب کے 5 منٹ بعد"
    if (
      !timeString ||
      timeString.includes("منٹ") ||
      timeString.includes("آفتاب")
    ) {
      return timeString;
    }

    // Handle HH:MM:SS format
    const timeParts = timeString.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hour12}:${formattedMinutes} ${ampm}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ConfirmDialog />

      {(isLoading || isFetching || isUpdating) && (
        <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
          <ProgressSpinner style={{ width: "60px", height: "60px" }} />
        </div>
      )}

      {/* Header Section */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Namaz Timings
            </h1>
            <p className="text-gray-600">
              Manage namaz timings for Multan Shareef
            </p>
          </div>
          {/* <div className="flex items-center gap-4">
            <Button
              label="Add New"
              icon="pi pi-plus"
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2 rounded"
              disabled={editingItemId !== null}
            />
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <InputText
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search namaz..."
                className="bg-white border-gray-300 text-gray-900 pl-10 pr-4 py-2 rounded w-64"
              />
            </div>
          </div> */}
        </div>

        {/* Current Namaz Timings Card */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          {/* <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Namaz Timings
            </h2>
            <Button
              label="Edit"
              icon="pi pi-pencil"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded"
              onClick={() => {
              }}
            />
          </div> */}

          {/* Prayer Times Grid */}
          {paginatedNamazData?.data && paginatedNamazData.data.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {NAMAZ_TIMES.map((namazTime) => {
                  const namazRecord = paginatedNamazData.data[0];
                  const time = namazRecord[namazTime.key] as string;

                  return (
                    <div
                      key={namazTime.key}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                        <span>{namazTime.icon}</span>
                        <span>{namazTime.label}</span>
                      </div>
                      <div className="text-gray-900 text-2xl font-bold mb-2">
                        {formatTimeToAMPM(time)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Button */}
              <div className="flex justify-end mb-6">
                <Button
                  label="Edit All Times"
                  icon="pi pi-pencil"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2 rounded"
                  onClick={() => handleEditClick(paginatedNamazData.data[0])}
                  disabled={editingItemId !== null || isUpdating}
                />
              </div>
            </>
          )}

          {/* Description Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-700 text-sm mb-2 font-medium">
                Description (English)
              </h3>
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                {paginatedNamazData?.data && paginatedNamazData.data.length > 0
                  ? paginatedNamazData.data[0].description_en ||
                    "No description available"
                  : "No description available"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-gray-700 text-sm mb-2 font-medium">
                Description (Urdu)
              </h3>
              <p
                className="text-gray-900 text-sm leading-relaxed whitespace-pre-line"
                dir="rtl"
              >
                {paginatedNamazData?.data && paginatedNamazData.data.length > 0
                  ? paginatedNamazData.data[0].description_ur ||
                    "تفصیل دستیاب نہیں"
                  : "تفصیل دستیاب نہیں"}
              </p>
            </div>
          </div>

          {/* Last Updated Info */}
          {paginatedNamazData?.data && paginatedNamazData.data.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="text-gray-600 text-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Created:</span>
                  <span>
                    {formatDateTime(paginatedNamazData.data[0].created_at).date}{" "}
                    -{" "}
                    {formatDateTime(paginatedNamazData.data[0].created_at).time}
                  </span>
                </div>
                {paginatedNamazData.data[0].updated_at && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Last Updated:</span>
                    <span>
                      {
                        formatDateTime(paginatedNamazData.data[0].updated_at)
                          .date
                      }{" "}
                      -{" "}
                      {
                        formatDateTime(paginatedNamazData.data[0].updated_at)
                          .time
                      }
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Created By:</span>
                  <span>User ID: {paginatedNamazData.data[0].created_by}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Updated By:</span>
                  <span>User ID: {paginatedNamazData.data[0].updated_by}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Namaz Times"
        visible={showEditDialog}
        style={{ width: "600px" }}
        onHide={handleCancelEdit}
      >
        {editFormData && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Prayer Times Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Prayer Times</h3>

              {NAMAZ_TIMES.map((namazTime) => (
                <div
                  key={namazTime.key}
                  className="grid grid-cols-2 gap-3 items-center"
                >
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>{namazTime.icon}</span>
                    <span>{namazTime.label}</span>
                  </label>
                  <InputText
                    type={namazTime.key === "maghrib" ? "text" : "time"}
                    value={editFormData[namazTime.key] as string}
                    onChange={(e) =>
                      handleEditInputChange(namazTime.key, e.target.value)
                    }
                    className="w-full bg-white border-gray-300 text-gray-900 p-2 rounded"
                    placeholder={
                      namazTime.key === "maghrib"
                        ? "e.g., غروب آفتاب کے 5 منٹ بعد"
                        : ""
                    }
                  />
                </div>
              ))}
            </div>

            {/* Descriptions Section */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Descriptions</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={editFormData.description_en || ""}
                  onChange={(e) =>
                    handleEditInputChange("description_en", e.target.value)
                  }
                  className="w-full bg-white border border-gray-300 text-gray-900 p-2 rounded min-h-[100px]"
                  placeholder="Enter English description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Urdu)
                </label>
                <textarea
                  value={editFormData.description_ur || ""}
                  onChange={(e) =>
                    handleEditInputChange("description_ur", e.target.value)
                  }
                  className="w-full bg-white border border-gray-300 text-gray-900 p-2 rounded min-h-[100px]"
                  placeholder="Enter Urdu description"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
              <Button
                label="Cancel"
                icon="pi pi-times"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded"
                onClick={handleCancelEdit}
              />
              <Button
                label="Save All Changes"
                icon="pi pi-check"
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2 rounded"
                onClick={handleSaveEdit}
                disabled={isUpdating}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

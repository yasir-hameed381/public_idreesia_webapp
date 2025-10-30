"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DutyRosterService, {
  ConsolidatedDutyRoster,
  User,
} from "@/services/DutyRosters";
import DutyTypeService, { DutyType } from "@/services/DutyTypes";
import { toast } from "sonner";

interface Zone {
  id: number;
  title_en: string;
  city_en: string;
  country_en: string;
}

interface Mehfil {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en: string;
}

const DutyRosterPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rosters, setRosters] = useState<ConsolidatedDutyRoster[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [availableKarkuns, setAvailableKarkuns] = useState<User[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfils, setMehfils] = useState<Mehfil[]>([]);

  // Filters
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(
    user?.zone_id || null
  );
  const [selectedMehfilId, setSelectedMehfilId] = useState<number | null>(
    user?.mehfil_directory_id || null
  );
  const [userTypeFilter, setUserTypeFilter] = useState<string>("karkun");
  const [search, setSearch] = useState("");

  // Modals
  const [showAddKarkunModal, setShowAddKarkunModal] = useState(false);
  const [showAddDutyModal, setShowAddDutyModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedDutyTypeId, setSelectedDutyTypeId] = useState<number | null>(
    null
  );

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayLabels: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  // Permissions
  const canFilterZones = user?.is_all_region_admin || user?.is_region_admin;
  const canFilterMehfils = canFilterZones || user?.is_zone_admin;
  const isReadOnly = selectedZoneId && !selectedMehfilId;
  const canManageRoster =
    !isReadOnly &&
    (userTypeFilter === "karkun" ||
      user?.is_all_region_admin ||
      user?.is_region_admin ||
      user?.is_zone_admin);

  // Load data
  useEffect(() => {
    if (selectedZoneId) {
      loadRosterData();
      loadDutyTypes();
    }
  }, [selectedZoneId, selectedMehfilId, userTypeFilter, search]);

  useEffect(() => {
    if (selectedMehfilId && selectedZoneId) {
      loadAvailableKarkuns();
    }
  }, [selectedMehfilId, selectedZoneId, userTypeFilter]);

  const loadRosterData = async () => {
    try {
      setLoading(true);
      const response = await DutyRosterService.getAllDutyRosters(
        selectedZoneId || undefined,
        selectedMehfilId || undefined,
        userTypeFilter,
        search
      );
      setRosters(response.data || []);
    } catch (error) {
      console.error("Error loading roster data:", error);
      toast.error("Failed to load roster data");
    } finally {
      setLoading(false);
    }
  };

  const loadDutyTypes = async () => {
    if (!selectedZoneId) return;
    try {
      const types = await DutyTypeService.getDutyTypesByZone(selectedZoneId);
      setDutyTypes(types);
    } catch (error) {
      console.error("Error loading duty types:", error);
    }
  };

  const loadAvailableKarkuns = async () => {
    if (!selectedZoneId || !selectedMehfilId) return;
    try {
      const karkuns = await DutyRosterService.getAvailableKarkuns(
        selectedZoneId,
        selectedMehfilId,
        userTypeFilter
      );
      setAvailableKarkuns(karkuns);
    } catch (error) {
      console.error("Error loading available karkuns:", error);
    }
  };

  const handleAddKarkun = async (userId: number) => {
    if (!selectedZoneId || !selectedMehfilId) {
      toast.error("Please select a zone and mehfil first");
      return;
    }

    try {
      await DutyRosterService.addKarkunToRoster(
        userId,
        selectedZoneId,
        selectedMehfilId
      );
      toast.success("Karkun added to roster successfully");
      setShowAddKarkunModal(false);
      loadRosterData();
      loadAvailableKarkuns();
    } catch (error: any) {
      console.error("Error adding karkun:", error);
      toast.error(error.response?.data?.message || "Failed to add karkun");
    }
  };

  const handleAddDuty = async () => {
    if (!selectedRosterId || !selectedDay || !selectedDutyTypeId) {
      toast.error("Please select all required fields");
      return;
    }

    try {
      await DutyRosterService.addDuty(
        selectedRosterId,
        selectedDay,
        selectedDutyTypeId
      );
      toast.success("Duty added successfully");
      setShowAddDutyModal(false);
      resetDutyModal();
      loadRosterData();
    } catch (error: any) {
      console.error("Error adding duty:", error);
      toast.error(error.response?.data?.message || "Failed to add duty");
    }
  };

  const handleRemoveDuty = async (assignmentId: number) => {
    try {
      await DutyRosterService.removeDuty(assignmentId);
      toast.success("Duty removed successfully");
      loadRosterData();
    } catch (error) {
      console.error("Error removing duty:", error);
      toast.error("Failed to remove duty");
    }
  };

  const handleRemoveKarkun = async () => {
    if (!selectedRosterId) return;

    try {
      await DutyRosterService.removeKarkunFromRoster(selectedRosterId);
      toast.success("Karkun removed from roster successfully");
      setShowRemoveModal(false);
      setSelectedRosterId(null);
      loadRosterData();
      loadAvailableKarkuns();
    } catch (error) {
      console.error("Error removing karkun:", error);
      toast.error("Failed to remove karkun");
    }
  };

  const handleDownloadPDF = async (includeAll = false) => {
    if (!selectedZoneId) {
      toast.error("Please select a zone to download the roster");
      return;
    }

    try {
      const blob = await DutyRosterService.downloadRosterPDF(
        selectedZoneId,
        selectedMehfilId || undefined,
        includeAll
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `duty-roster-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const openAddDutyModal = (rosterId: number, day: string) => {
    setSelectedRosterId(rosterId);
    setSelectedDay(day);
    setShowAddDutyModal(true);
  };

  const resetDutyModal = () => {
    setSelectedRosterId(null);
    setSelectedDay("");
    setSelectedDutyTypeId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <hr className="border-gray-300 mb-6" />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Duty Roster Management
              </h2>
              <p className="text-gray-600">
                Manage karkun duty assignments for mehfils
              </p>
            </div>
            {selectedZoneId && (
              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleDownloadPDF(false)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download PDF
                </button>
                {!selectedMehfilId && (
                  <button
                    onClick={() => handleDownloadPDF(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                value={selectedZoneId || ""}
                onChange={(e) => {
                  setSelectedZoneId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setSelectedMehfilId(null);
                }}
                disabled={!canFilterZones}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !canFilterZones ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.title_en} - {zone.city_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Mehfil Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mehfil
              </label>
              <select
                value={selectedMehfilId || ""}
                onChange={(e) =>
                  setSelectedMehfilId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!canFilterMehfils || !selectedZoneId}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  !canFilterMehfils || !selectedZoneId
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">All Mehfils</option>
                {mehfils.map((mehfil) => (
                  <option key={mehfil.id} value={mehfil.id}>
                    #{mehfil.mehfil_number} - {mehfil.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="karkun">Karkun</option>
                <option value="ehad-karkun">Ehad Karkun</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search karkuns..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Add Karkun Button */}
          {canManageRoster && selectedMehfilId && (
            <div className="mt-4">
              <button
                onClick={() => setShowAddKarkunModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Karkun to Roster
              </button>
            </div>
          )}
        </div>

        {/* Roster Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : !selectedZoneId ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Please select a zone to view duty roster
            </p>
          </div>
        ) : rosters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No duty rosters found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Karkun
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                    >
                      {dayLabels[day]}
                    </th>
                  ))}
                  {canManageRoster && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rosters.map((roster) => (
                  <tr key={roster.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {roster.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {roster.user.phone_number}
                        </div>
                      </div>
                    </td>
                    {days.map((day) => (
                      <td key={day} className="px-4 py-3 text-sm min-w-[150px]">
                        <div className="space-y-1">
                          {roster.duties[
                            day as keyof typeof roster.duties
                          ]?.map((duty) => (
                            <div
                              key={duty.id}
                              className="flex items-center justify-between bg-blue-50 px-2 py-1 rounded text-xs"
                            >
                              <span className="flex-1">
                                {duty.duty_type.name}
                                {duty.mehfil && !selectedMehfilId && (
                                  <div className="text-gray-500 text-xs">
                                    #{duty.mehfil.mehfil_number}
                                  </div>
                                )}
                              </span>
                              {canManageRoster && duty.id && (
                                <button
                                  onClick={() => handleRemoveDuty(duty.id!)}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          {canManageRoster && roster.roster_id && (
                            <button
                              onClick={() =>
                                openAddDutyModal(roster.roster_id!, day)
                              }
                              className="w-full text-xs text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 rounded py-1"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </td>
                    ))}
                    {canManageRoster && (
                      <td className="px-4 py-3 whitespace-nowrap text-center sticky right-0 bg-white z-10">
                        <button
                          onClick={() => {
                            setSelectedRosterId(roster.roster_id!);
                            setShowRemoveModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Karkun Modal */}
        {showAddKarkunModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add Karkun to Roster
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                {availableKarkuns.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    All karkuns are already in the roster
                  </p>
                ) : (
                  availableKarkuns.map((karkun) => (
                    <button
                      key={karkun.id}
                      onClick={() => handleAddKarkun(karkun.id)}
                      className="w-full text-left px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{karkun.name}</div>
                      <div className="text-sm text-gray-500">
                        {karkun.email}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowAddKarkunModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Duty Modal */}
        {showAddDutyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add Duty for {dayLabels[selectedDay]}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Duty Type
                </label>
                <select
                  value={selectedDutyTypeId || ""}
                  onChange={(e) =>
                    setSelectedDutyTypeId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a duty type</option>
                  {dutyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddDuty}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Duty
                </button>
                <button
                  onClick={() => {
                    setShowAddDutyModal(false);
                    resetDutyModal();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remove Karkun Confirmation Modal */}
        {showRemoveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove this karkun from the roster? All
                their duty assignments will be deleted.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRemoveKarkun}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedRosterId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DutyRosterPage;

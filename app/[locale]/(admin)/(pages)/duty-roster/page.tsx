"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, PlusCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { PERMISSIONS } from "@/types/permission";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
    /\/$/,
    ""
  );

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface DutyType {
  id: number;
  name: string;
  zone_id: number;
}

interface DutyAssignment {
  id: number;
  duty_type_id: number;
  duty_type: DutyType;
  mehfil?: MehfilDirectory;
}

interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en?: string;
  address_en?: string;
}

interface DutyRoster {
  roster_id?: number;
  user_id: number;
  user: User;
  mehfil_directory_id?: number;
  mehfil_directory?: MehfilDirectory;
  duties: Record<(typeof DAYS)[number], DutyAssignment[]>;
}

interface Zone {
  id: number;
  title_en: string;
  city_en?: string;
}

interface User {
  id: number;
  name: string;
  father_name?: string;
  user_type: string;
  phone_number?: string;
  email?: string;
  avatar?: string;
}

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    console.log("Retrieved auth token from localStorage:", token);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || "Something went wrong";
  }
  return "Something went wrong";
};

export default function DutyRosterPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [mehfilDirectories, setMehfilDirectories] = useState<MehfilDirectory[]>(
    []
  );
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [availableKarkuns, setAvailableKarkuns] = useState<User[]>([]);
  const [rosters, setRosters] = useState<DutyRoster[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [loadingRosters, setLoadingRosters] = useState(false);

  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedMehfil, setSelectedMehfil] = useState<number | null>(null);
  const [userTypeFilter, setUserTypeFilter] =
    useState<"karkun" | "ehad-karkun">("karkun");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [addKarkunModalOpen, setAddKarkunModalOpen] = useState(false);
  const [removeRosterId, setRemoveRosterId] = useState<number | null>(null);
  const [selectedDuties, setSelectedDuties] = useState<Record<string, number>>(
    {}
  );

  const defaultsAppliedRef = useRef(false);

  const isReadOnly = useMemo(
    () => Boolean(selectedZone && !selectedMehfil),
    [selectedZone, selectedMehfil]
  );

  const canManageRoster = useMemo(() => {
    if (isReadOnly) {
      return false;
    }
    if (userTypeFilter === "ehad-karkun") {
      return Boolean(
        user?.is_all_region_admin ||
          user?.is_region_admin ||
          user?.is_zone_admin
      );
    }
    return true;
  }, [isReadOnly, userTypeFilter, user]);

  const fetchZones = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/zones`, {
        headers: getAuthHeaders(),
      });
      setZones(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch zones", {
        description: extractErrorMessage(error),
      });
    }
  }, []);

  const fetchMehfilDirectories = useCallback(async () => {
    if (!selectedZone) {
      setMehfilDirectories([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/dashboard/mehfils/${selectedZone}`,
        {
          headers: getAuthHeaders(),
        }
      );
      setMehfilDirectories(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch mehfils", {
        description: extractErrorMessage(error),
      });
    }
  }, [selectedZone]);

  const fetchDutyTypes = useCallback(async () => {
    if (!selectedZone) {
      setDutyTypes([]);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/duty-types-data`, {
        params: { zone_id: selectedZone },
        headers: getAuthHeaders(),
      });
      setDutyTypes(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load duty types", {
        description: extractErrorMessage(error),
      });
    }
  }, [selectedZone]);

  const fetchAvailableKarkuns = useCallback(async () => {
    if (!selectedZone) {
      setAvailableKarkuns([]);
      return;
    }

    if (userTypeFilter === "karkun" && !selectedMehfil) {
      setAvailableKarkuns([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/duty-rosters-data/available-karkuns`,
        {
          params: {
            zoneId: selectedZone,
            mehfilDirectoryId: selectedMehfil ?? undefined,
            userTypeFilter,
          },
          headers: getAuthHeaders(),
        }
      );
      setAvailableKarkuns(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch karkuns", {
        description: extractErrorMessage(error),
      });
    }
  }, [selectedZone, selectedMehfil, userTypeFilter]);

  const fetchRosters = useCallback(async () => {
    setLoadingRosters(true);
    try {
      // Simple fetch - no filters applied
      const response = await axios.get(`${API_URL}/duty-rosters-data`, {
        headers: getAuthHeaders(),
      });

      const rostersData = response.data.data || [];
      console.log("[DutyRoster] Fetched rosters:", rostersData);
      
      // Log a sample roster with duties
      if (rostersData.length > 0) {
        console.log("[DutyRoster] Sample roster:", rostersData[0]);
        console.log("[DutyRoster] Sample duties:", rostersData[0]?.duties);
      }

      setRosters(rostersData);
      setShowTable(true);
    } catch (error) {
      toast.error("Failed to fetch duty roster", {
        description: extractErrorMessage(error),
      });
    } finally {
      setLoadingRosters(false);
    }
  }, []); // No dependencies - fetch all data

  useEffect(() => {
    if (!authLoading) {
      fetchZones();
    }
  }, [authLoading, fetchZones]);

  useEffect(() => {
    if (!authLoading && user && !defaultsAppliedRef.current) {
      if (user.zone_id) {
        setSelectedZone(user.zone_id);
      }
      if (user.mehfil_directory_id) {
        setSelectedMehfil(user.mehfil_directory_id);
      }
      defaultsAppliedRef.current = true;
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading) return;
    fetchMehfilDirectories();
    fetchDutyTypes();
  }, [authLoading, fetchDutyTypes, fetchMehfilDirectories]);

  useEffect(() => {
    if (authLoading) return;
    fetchRosters();
  }, [authLoading, fetchRosters]);

  useEffect(() => {
    if (authLoading) return;
    fetchAvailableKarkuns();
  }, [authLoading, fetchAvailableKarkuns]);

  const handleAddKarkunToRoster = async (userId: number) => {
    if (!selectedZone || !selectedMehfil) {
      toast.error("Please select a zone and mehfil before adding to the roster");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/duty-rosters-data/add`,
        {
          user_id: userId,
          zone_id: selectedZone,
          mehfil_directory_id: selectedMehfil,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Karkun added to roster successfully");
      setAddKarkunModalOpen(false);
      await Promise.all([fetchRosters(), fetchAvailableKarkuns()]);
    } catch (error) {
      toast.error("Failed to add karkun to roster", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleAddDuty = async (
    rosterId: number | undefined,
    day: (typeof DAYS)[number],
    dutyTypeId: number,
    cellKey?: string
  ) => {
    if (!rosterId || !dutyTypeId) {
      console.warn(
        "[DutyRoster] Missing rosterId or dutyTypeId",
        rosterId,
        dutyTypeId,
        { day, cellKey }
      );
      return;
    }

    console.log(
      "[DutyRoster] Submitting duty assignment",
      JSON.stringify(
        {
          rosterId,
          day,
          dutyTypeId,
          cellKey,
          mehfilDirectoryId: selectedMehfil,
        },
        null,
        2
      )
    );

    try {
      await axios.post(
        `${API_URL}/duty-rosters-data/add-duty`,
        {
          mehfilDirectoryId: selectedMehfil,
          rosterId,
          day,
          dutyTypeId,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Duty added successfully");
      await fetchRosters();

      console.log(
        "[DutyRoster] Duty assignment saved, clearing select key",
        cellKey
      );
      if (cellKey) {
        setSelectedDuties((prev) => {
          const next = { ...prev };
          delete next[cellKey];
          return next;
        });
      }
    } catch (error) {
      console.error("[DutyRoster] Failed to add duty", {
        rosterId,
        day,
        dutyTypeId,
        cellKey,
        error,
      });
      toast.error("Failed to add duty", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleRemoveDuty = async (assignmentId: number) => {
    try {
      await axios.delete(
        `${API_URL}/duty-rosters-data/remove-duty/${assignmentId}`,
        { headers: getAuthHeaders() }
      );
      toast.success("Duty removed successfully");
      await fetchRosters();
    } catch (error) {
      toast.error("Failed to remove duty", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleRemoveKarkunFromRoster = async () => {
    if (!removeRosterId) return;

    try {
      await axios.delete(`${API_URL}/duty-rosters-data/${removeRosterId}`, {
        headers: getAuthHeaders(),
      });
      toast.success("Karkun removed from roster successfully");
      setRemoveRosterId(null);
      await Promise.all([fetchRosters(), fetchAvailableKarkuns()]);
    } catch (error) {
      toast.error("Failed to remove karkun", {
        description: extractErrorMessage(error),
      });
    }
  };

  const handleZoneChange = (value: string) => {
    if (value) {
      setSelectedZone(Number(value));
    } else {
      setSelectedZone(null);
    }
    setSelectedMehfil(null);
    setRosters([]);
    setShowTable(false);
  };

  const availableOptions = useMemo(() => {
    const existing = new Set(rosters.map((roster) => roster.user_id));
    return availableKarkuns.filter((karkun) => !existing.has(karkun.id));
  }, [availableKarkuns, rosters]);

  // Client-side filtering based on search term
  const filteredRosters = useMemo(() => {
    if (!debouncedSearch) {
      return rosters;
    }
    
    const searchLower = debouncedSearch.toLowerCase();
    return rosters.filter((roster) => {
      const userName = roster.user?.name?.toLowerCase() || "";
      const userEmail = roster.user?.email?.toLowerCase() || "";
      const userPhone = roster.user?.phone_number?.toLowerCase() || "";
      
      return (
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        userPhone.includes(searchLower)
      );
    });
  }, [rosters, debouncedSearch]);

  return (
    <PermissionWrapper requiredPermission={PERMISSIONS.VIEW_DUTY_ROSTER}>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" /> Duty Roster Management
          </h1>
        </div>

        {/* Filters commented out - showing all duty rosters to all users */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={selectedZone ? String(selectedZone) : ""}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Zones</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={String(zone.id)}>
                  {zone.title_en}
                  {zone.city_en ? ` — ${zone.city_en}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMehfil ? String(selectedMehfil) : ""}
            onValueChange={(value) =>
              setSelectedMehfil(value ? Number(value) : null)
            }
            disabled={!selectedZone}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Mehfil (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Mehfils</SelectItem>
              {mehfilDirectories.map((mehfil) => (
                <SelectItem key={mehfil.id} value={String(mehfil.id)}>
                  #{mehfil.mehfil_number}
                  {mehfil.name_en ? ` — ${mehfil.name_en}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userTypeFilter}
            onValueChange={(value: "karkun" | "ehad-karkun") =>
              setUserTypeFilter(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="User type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="karkun">Karkun</SelectItem>
              <SelectItem value="ehad-karkun">Ehad Karkun</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Input
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {/* {isReadOnly && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Viewing roster across all mehfils in the selected zone. Select a
            specific mehfil to manage assignments.
          </div>
        )} */}

        {canManageRoster && selectedMehfil && (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Dialog open={addKarkunModalOpen} onOpenChange={setAddKarkunModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <PlusCircle className="h-4 w-4" />
                  <span className="ml-2">
                    {userTypeFilter === "karkun"
                      ? "Add Karkun to Roster"
                      : "Add Ehad Karkun to Roster"}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {userTypeFilter === "karkun"
                      ? "Select Karkun"
                      : "Select Ehad Karkun"}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                  {availableOptions.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      All eligible users are already part of the roster.
                    </div>
                  ) : (
                    availableOptions.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 hover:bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          {candidate.father_name && (
                            <div className="text-xs text-muted-foreground">
                              Son of {candidate.father_name}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddKarkunToRoster(candidate.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-sm text-muted-foreground">
              {dutyTypes.length} duty type{dutyTypes.length === 1 ? "" : "s"}{" "}
              loaded
            </div>
          </div>
        )}

        {showTable ? (
          <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Karkun</TableHead>
                  {!selectedMehfil && (
                    <TableHead className="min-w-[120px]">Mehfil</TableHead>
                  )}
                  {DAYS.map((day) => (
                    <TableHead key={day} className="text-center">
                      {DAY_LABELS[day]}
                    </TableHead>
                  ))}
                  {canManageRoster && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRosters && (
                  <TableRow>
                    <TableCell colSpan={canManageRoster ? 9 : 8}>
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Loading roster&hellip;
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loadingRosters && filteredRosters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManageRoster ? 9 : 8}>
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No duty assignments found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loadingRosters &&
                  filteredRosters.map((roster) => (
                    <TableRow key={roster.roster_id ?? roster.user_id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{roster.user?.name}</div>
                        {roster.user?.father_name && (
                          <div className="text-xs text-muted-foreground">
                            Son of {roster.user.father_name}
                          </div>
                        )}
                        {roster.user?.phone_number && (
                          <div className="text-xs text-muted-foreground">
                            {roster.user.phone_number}
                          </div>
                        )}
                      </TableCell>
                      {!selectedMehfil && (
                        <TableCell className="align-top text-sm text-muted-foreground">
                          {roster.mehfil_directory?.mehfil_number
                            ? `#${roster.mehfil_directory.mehfil_number}`
                            : "—"}
                        </TableCell>
                      )}
                      // Replace the DAYS.map section in your TableBody with this fixed version:

{DAYS.map((day) => {
  // Safely access duties for this day
  const assignments = Array.isArray(roster.duties?.[day]) 
    ? roster.duties[day] 
    : [];

  const rosterRowId = roster.roster_id ?? roster.user_id;
  const selectKey = rosterRowId != null ? `${rosterRowId}-${day}` : null;
  
  // Debug logging (remove in production)
  if (roster.roster_id === 1023 && day === 'monday') {
    console.log(`[Debug] ${day} for roster ${roster.roster_id}:`, {
      assignments,
      assignmentsCount: assignments.length,
      rawDuties: roster.duties?.[day],
      allDuties: roster.duties
    });
  }
  
  return (
    <TableCell key={day} className="align-top">
      <div className="space-y-2">
        {/* Show placeholder if no assignments */}
        {assignments.length === 0 && (
          <div className="text-xs text-muted-foreground text-center">
            —
          </div>
        )}
        
        {/* Display each duty assignment */}
        {assignments.map((assignment) => {
          const dutyName = assignment.duty_type?.name || `Duty ${assignment.duty_type_id}`;
          const mehfilNumber = assignment.mehfil?.mehfil_number;
          
          return (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-md bg-primary/10 px-2 py-1 text-xs"
            >
              <span className="font-medium text-primary">
                {dutyName}
                {mehfilNumber && !selectedMehfil && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    (#{mehfilNumber})
                  </span>
                )}
              </span>
              {canManageRoster && (
                <button
                  className="ml-2 text-destructive hover:text-destructive/80 transition-colors"
                  onClick={() => handleRemoveDuty(assignment.id)}
                  aria-label={`Remove ${dutyName}`}
                  title={`Remove ${dutyName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
        
        {/* Add new duty dropdown */}
        {canManageRoster &&
          selectedMehfil &&
          dutyTypes.length > 0 &&
          selectKey && (
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={selectedDuties[selectKey] ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                
                if (!value) {
                  // Clear selection
                  setSelectedDuties((prev) => {
                    const next = { ...prev };
                    delete next[selectKey];
                    return next;
                  });
                  return;
                }
                
                // Set selection and immediately add duty
                setSelectedDuties((prev) => ({
                  ...prev,
                  [selectKey]: value,
                }));
                
                void handleAddDuty(
                  rosterRowId,
                  day,
                  value,
                  selectKey
                );
              }}
            >
              <option value="">+ Add Duty</option>
              {dutyTypes.map((dutyType) => (
                <option key={dutyType.id} value={dutyType.id}>
                  {dutyType.name}
                </option>
              ))}
            </select>
          )}
      </div>
    </TableCell>
  );
})}
                      {canManageRoster && (
                        <TableCell className="align-top text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setRemoveRosterId(roster.roster_id ?? null)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        {/* : (
          <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            Select a zone to view the duty roster.
          </div>
        )} */}

        <Dialog open={Boolean(removeRosterId)} onOpenChange={() => setRemoveRosterId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove from roster?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Removing this karkun will delete all of their duty assignments for
              the selected mehfil.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRemoveRosterId(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveKarkunFromRoster}>
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionWrapper>
  );
}
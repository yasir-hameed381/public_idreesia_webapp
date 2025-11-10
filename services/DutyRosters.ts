import axios from "axios";
import { DutyType } from "./DutyTypes";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  user_type?: string;
  zone_id?: number;
  mehfil_directory_id?: number;
}

export interface MehfilDirectory {
  id: number;
  mehfil_number: string;
  name_en: string;
  address_en: string;
}

export interface DutyRosterAssignment {
  id?: number;
  duty_roster_id: number;
  duty_type_id: number;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dutyType?: DutyType;
}

export interface DutyRoster {
  id?: number;
  region_id?: number;
  zone_id?: number;
  mehfil_directory_id?: number;
  user_id: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
  mehfilDirectory?: MehfilDirectory;
  assignments?: DutyRosterAssignment[];
}

export interface ConsolidatedDutyRoster {
  roster_id?: number;
  mehfil_directory_id?: number;
  user_id: number;
  user: User;
  duties: {
    monday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    tuesday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    wednesday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    thursday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    friday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    saturday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
    sunday: Array<{ id?: number; duty_type_id: number; duty_type: DutyType; mehfil?: MehfilDirectory }>;
  };
}

export interface DutyRosterListResponse {
  success: boolean;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  data: ConsolidatedDutyRoster[];
  showTable?: boolean;
  isReadOnly?: boolean;
}

class DutyRosterService {
  /**
   * Get all duty rosters with pagination and filters
   */
  async getAllDutyRosters(
    zoneId?: number,
    mehfilDirectoryId?: number,
    userTypeFilter = 'karkun',
    search = ''
  ): Promise<DutyRosterListResponse> {
    const response = await apiClient.get('/duty-rosters-data', {
      params: { zoneId, mehfilDirectoryId, userTypeFilter, search },
    });
    return response.data;
  }

  /**
   * Get duty roster by user
   */
  async getDutyRosterByKarkun(userId: number): Promise<DutyRoster[]> {
    const response = await apiClient.get(`/duty-rosters-data/karkun/${userId}`);
    return response.data.data;
  }

  /**
   * Get a single duty roster by ID
   */
  async getDutyRosterById(id: number): Promise<DutyRoster> {
    const response = await apiClient.get(`/duty-rosters-data/${id}`);
    return response.data.data;
  }

  /**
   * Add karkun to roster
   */
  async addKarkunToRoster(userId: number, zoneId: number, mehfilDirectoryId: number): Promise<DutyRoster> {
    const response = await apiClient.post('/duty-rosters-data/add', {
      user_id: userId,
      zone_id: zoneId,
      mehfil_directory_id: mehfilDirectoryId,
    });
    return response.data.data;
  }

  /**
   * Add duty assignment
   */
  async addDuty(
    rosterId: number,
    day: string,
    dutyTypeId: number,
    mehfilDirectoryId?: number
  ): Promise<DutyRosterAssignment> {
    const response = await apiClient.post('/duty-rosters-data/add-duty', {
      rosterId,
      day: day.toLowerCase(),
      dutyTypeId,
      mehfilDirectoryId,
    });
    return response.data.data ?? response.data;
  }

  /**
   * Remove duty assignment
   */
  async removeDuty(assignmentId: number): Promise<void> {
    await apiClient.delete(`/duty-rosters-data/remove-duty/${assignmentId}`);
  }

  /**
   * Remove all duties for a karkun (delete roster)
   */
  async removeKarkunFromRoster(rosterId: number): Promise<void> {
    await apiClient.delete(`/duty-rosters-data/${rosterId}`);
  }

  /**
   * Download duty roster as PDF
   */
  async downloadRosterPDF(
    zoneId: number,
    mehfilDirectoryId?: number,
    includeAll = false
  ): Promise<Blob> {
    const response = await apiClient.get('/duty-rosters-data/download-pdf', {
      params: { zoneId, mehfilDirectoryId, includeAll },
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  /**
   * Get available karkuns for roster (not yet added)
   */
  async getAvailableKarkuns(
    zoneId: number,
    mehfilDirectoryId: number,
    userType = 'karkun'
  ): Promise<User[]> {
    const response = await apiClient.get('/duty-rosters-data/available-karkuns', {
      params: { zoneId, mehfilDirectoryId, userTypeFilter: userType },
    });
    return response.data.data;
  }
}

export default new DutyRosterService();



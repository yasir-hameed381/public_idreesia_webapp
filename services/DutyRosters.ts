import axios from 'axios';
import { DutyType } from './DutyTypes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

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
    const response = await axios.get(`${API_URL}duty-rosters-data`, {
      params: { zoneId, mehfilDirectoryId, userTypeFilter, search },
    });
    return response.data;
  }

  /**
   * Get duty roster by user
   */
  async getDutyRosterByKarkun(userId: number): Promise<DutyRoster[]> {
    const response = await axios.get(`${API_URL}duty-rosters-data/karkun/${userId}`);
    return response.data.data;
  }

  /**
   * Get a single duty roster by ID
   */
  async getDutyRosterById(id: number): Promise<DutyRoster> {
    const response = await axios.get(`${API_URL}duty-rosters-data/${id}`);
    return response.data.data;
  }

  /**
   * Add karkun to roster
   */
  async addKarkunToRoster(userId: number, zoneId: number, mehfilDirectoryId: number): Promise<DutyRoster> {
    const response = await axios.post(`${API_URL}duty-rosters-data/add-karkun`, {
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
    dutyTypeId: number
  ): Promise<DutyRosterAssignment> {
    const response = await axios.post(`${API_URL}duty-rosters-data/add-duty`, {
      duty_roster_id: rosterId,
      day: day.toLowerCase(),
      duty_type_id: dutyTypeId,
    });
    return response.data.data;
  }

  /**
   * Remove duty assignment
   */
  async removeDuty(assignmentId: number): Promise<void> {
    await axios.delete(`${API_URL}duty-rosters-data/remove-duty/${assignmentId}`);
  }

  /**
   * Remove all duties for a karkun (delete roster)
   */
  async removeKarkunFromRoster(rosterId: number): Promise<void> {
    await axios.delete(`${API_URL}duty-rosters-data/${rosterId}`);
  }

  /**
   * Download duty roster as PDF
   */
  async downloadRosterPDF(
    zoneId: number,
    mehfilDirectoryId?: number,
    includeAll = false
  ): Promise<Blob> {
    const response = await axios.get(`${API_URL}duty-rosters-data/download-pdf`, {
      params: { zoneId, mehfilDirectoryId, includeAll },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get available karkuns for roster (not yet added)
   */
  async getAvailableKarkuns(
    zoneId: number,
    mehfilDirectoryId: number,
    userType = 'karkun'
  ): Promise<User[]> {
    const response = await axios.get(`${API_URL}duty-rosters-data/available-karkuns`, {
      params: { zoneId, mehfilDirectoryId, userType },
    });
    return response.data.data;
  }
}

export default new DutyRosterService();



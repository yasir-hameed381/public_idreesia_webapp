import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

export interface DutyRoster {
  id?: number;
  region_id?: number;
  zone_id?: number;
  mehfil_directory_id?: number;
  user_id: number;
  duty_type_id_monday?: number;
  duty_type_id_tuesday?: number;
  duty_type_id_wednesday?: number;
  duty_type_id_thursday?: number;
  duty_type_id_friday?: number;
  duty_type_id_saturday?: number;
  duty_type_id_sunday?: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DutyRosterListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: DutyRoster[];
}

class DutyRosterService {
  /**
   * Get all duty rosters with pagination and filters
   */
  async getAllDutyRosters(
    page = 1,
    size = 10,
    search = '',
    zoneId?: number,
    mehfilDirectoryId?: number
  ): Promise<DutyRosterListResponse> {
    const response = await axios.get(`${API_URL}duty-rosters-data`, {
      params: { page, size, search, zoneId, mehfilDirectoryId },
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
   * Create a new duty roster
   */
  async createDutyRoster(dutyRoster: DutyRoster): Promise<DutyRoster> {
    const response = await axios.post(`${API_URL}duty-rosters-data/add`, dutyRoster);
    return response.data.data;
  }

  /**
   * Update a duty roster
   */
  async updateDutyRoster(id: number, dutyRoster: Partial<DutyRoster>): Promise<DutyRoster> {
    const response = await axios.put(`${API_URL}duty-rosters-data/update/${id}`, dutyRoster);
    return response.data.data;
  }

  /**
   * Delete a duty roster
   */
  async deleteDutyRoster(id: number): Promise<void> {
    await axios.delete(`${API_URL}duty-rosters-data/${id}`);
  }
}

export default new DutyRosterService();



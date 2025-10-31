import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

export interface DutyType {
  id?: number;
  zone_id: number;
  name: string;
  description?: string;
  is_editable: boolean;
  is_hidden: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DutyTypeListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: DutyType[];
}

class DutyTypeService {
  /**
   * Get all duty types with pagination
   */
  async getAllDutyTypes(page = 1, size = 10, search = '', zoneId?: number): Promise<DutyTypeListResponse> {
    const response = await axios.get(`${API_URL}/duty-types-data`, {
      params: { page, size, search, zoneId },
    });
    return response.data;
  }

  /**
   * Get all active duty types
   */
  async getActiveDutyTypes(zoneId?: number): Promise<DutyType[]> {
    const response = await axios.get(`${API_URL}/duty-types-data/active`, {
      params: { zoneId },
    });
    return response.data.data;
  }

  /**
   * Get duty types by zone
   */
  async getDutyTypesByZone(zoneId: number): Promise<DutyType[]> {
    const response = await axios.get(`${API_URL}/duty-types-data/zone/${zoneId}`);
    return response.data.data;
  }

  /**
   * Get a single duty type by ID
   */
  async getDutyTypeById(id: number): Promise<DutyType> {
    const response = await axios.get(`${API_URL}/duty-types-data/${id}`);
    return response.data.data;
  }

  /**
   * Create a new duty type
   */
  async createDutyType(dutyType: DutyType): Promise<DutyType> {
    const response = await axios.post(`${API_URL}/duty-types-data/add`, dutyType);
    return response.data.data;
  }

  /**
   * Update a duty type
   */
  async updateDutyType(id: number, dutyType: Partial<DutyType>): Promise<DutyType> {
    const response = await axios.put(`${API_URL}/duty-types-data/update/${id}`, dutyType);
    return response.data.data;
  }

  /**
   * Delete a duty type
   */
  async deleteDutyType(id: number): Promise<void> {
    await axios.delete(`${API_URL}/duty-types-data/${id}`);
  }
}

export default new DutyTypeService();



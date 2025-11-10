import axios from "axios";

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

export interface DutyType {
  id?: number;
  zone_id: number;
  name: string;
  description?: string;
  is_editable: boolean;
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
    const response = await apiClient.get('/duty-types-data', {
      params: { page, size, search, zone_id: zoneId },
    });
    return response.data;
  }

  /**
   * Get all active duty types
   */
  async getActiveDutyTypes(zoneId?: number): Promise<DutyType[]> {
    const response = await apiClient.get('/duty-types-data/active', {
      params: { zone_id: zoneId },
    });
    return response.data.data;
  }

  /**
   * Get duty types by zone
   */
  async getDutyTypesByZone(zoneId: number): Promise<DutyType[]> {
    const response = await apiClient.get('/duty-types-data', {
      params: { zone_id: zoneId },
    });
    return response.data.data;
  }

  /**
   * Get a single duty type by ID
   */
  async getDutyTypeById(id: number): Promise<DutyType> {
    const response = await apiClient.get(`/duty-types-data/${id}`);
    return response.data.data;
  }

  /**
   * Create a new duty type
   */
  async createDutyType(dutyType: DutyType): Promise<DutyType> {
    const response = await apiClient.post('/duty-types-data/add', dutyType);
    return response.data.data;
  }

  /**
   * Update a duty type
   */
  async updateDutyType(id: number, dutyType: Partial<DutyType>): Promise<DutyType> {
    const response = await apiClient.put(`/duty-types-data/update/${id}`, dutyType);
    return response.data.data;
  }

  /**
   * Delete a duty type
   */
  async deleteDutyType(id: number): Promise<void> {
    await apiClient.delete(`/duty-types-data/${id}`);
  }
}

export default new DutyTypeService();



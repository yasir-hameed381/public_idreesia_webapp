import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/';

export interface MehfilCoordinator {
  id?: number;
  mehfil_directory_id: number;
  user_id: number;
  coordinator_type: string;
  duty_type_id_monday?: number;
  duty_type_id_tuesday?: number;
  duty_type_id_wednesday?: number;
  duty_type_id_thursday?: number;
  duty_type_id_friday?: number;
  duty_type_id_saturday?: number;
  duty_type_id_sunday?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CoordinatorListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: MehfilCoordinator[];
}

class MehfilCoordinatorService {
  /**
   * Get all coordinators with pagination
   */
  async getAllCoordinators(
    page = 1,
    size = 10,
    search = '',
    mehfilDirectoryId?: number
  ): Promise<CoordinatorListResponse> {
    const response = await axios.get(`${API_URL}/mehfil-coordinators`, {
      params: { page, size, search, mehfilDirectoryId },
    });
    return response.data;
  }

  /**
   * Get active coordinators for a mehfil
   */
  async getActiveCoordinatorsByMehfil(mehfilDirectoryId: number): Promise<MehfilCoordinator[]> {
    const response = await axios.get(
      `${API_URL}/mehfil-coordinators/active/${mehfilDirectoryId}`
    );
    return response.data.data;
  }

  /**
   * Get a single coordinator by ID
   */
  async getCoordinatorById(id: number): Promise<MehfilCoordinator> {
    const response = await axios.get(`${API_URL}/mehfil-coordinators/${id}`);
    return response.data.data;
  }

  /**
   * Create a new coordinator
   */
  async createCoordinator(coordinator: MehfilCoordinator): Promise<MehfilCoordinator> {
    const response = await axios.post(`${API_URL}/mehfil-coordinators/add`, coordinator);
    return response.data.data;
  }

  /**
   * Update a coordinator
   */
  async updateCoordinator(
    id: number,
    coordinator: Partial<MehfilCoordinator>
  ): Promise<MehfilCoordinator> {
    const response = await axios.put(
      `${API_URL}/mehfil-coordinators/update/${id}`,
      coordinator
    );
    return response.data.data;
  }

  /**
   * Delete a coordinator
   */
  async deleteCoordinator(id: number): Promise<void> {
    await axios.delete(`${API_URL}/mehfil-coordinators/${id}`);
  }
}

export default new MehfilCoordinatorService();



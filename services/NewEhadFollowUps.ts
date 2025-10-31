import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

export interface NewEhadFollowUp {
  id?: number;
  new_ehad_id: number;
  follow_up_date: string;
  contact_method: 'phone' | 'visit' | 'message' | 'other';
  status: 'contacted' | 'not_available' | 'interested' | 'not_interested' | 'committed';
  notes?: string;
  next_follow_up_date?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FollowUpListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: NewEhadFollowUp[];
}

class NewEhadFollowUpService {
  /**
   * Get all follow-ups with pagination
   */
  async getAllFollowUps(page = 1, size = 10, search = ''): Promise<FollowUpListResponse> {
    const response = await axios.get(`${API_URL}new-ehad-follow-ups`, {
      params: { page, size, search },
    });
    return response.data;
  }

  /**
   * Get follow-ups by new ehad ID
   */
  async getFollowUpsByNewEhadId(newEhadId: number): Promise<NewEhadFollowUp[]> {
    const response = await axios.get(`${API_URL}new-ehad-follow-ups/new-ehad/${newEhadId}`);
    return response.data.data;
  }

  /**
   * Get a single follow-up by ID
   */
  async getFollowUpById(id: number): Promise<NewEhadFollowUp> {
    const response = await axios.get(`${API_URL}new-ehad-follow-ups/${id}`);
    return response.data.data;
  }

  /**
   * Create a new follow-up
   */
  async createFollowUp(followUp: NewEhadFollowUp): Promise<NewEhadFollowUp> {
    const response = await axios.post(`${API_URL}new-ehad-follow-ups/add`, followUp);
    return response.data.data;
  }

  /**
   * Update a follow-up
   */
  async updateFollowUp(id: number, followUp: Partial<NewEhadFollowUp>): Promise<NewEhadFollowUp> {
    const response = await axios.put(`${API_URL}new-ehad-follow-ups/update/${id}`, followUp);
    return response.data.data;
  }

  /**
   * Delete a follow-up
   */
  async deleteFollowUp(id: number): Promise<void> {
    await axios.delete(`${API_URL}new-ehad-follow-ups/${id}`);
  }
}

export default new NewEhadFollowUpService();



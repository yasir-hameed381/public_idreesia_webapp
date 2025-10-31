import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';

export interface TarteebRequest {
  id?: number;
  zone_id: number;
  mehfil_directory_id: number;
  email: string;
  phone_number: string;
  full_name: string;
  father_name: string;
  age: number;
  gender: 'male' | 'female';
  city: string;
  country: string;
  introducer_name: string;
  ehad_duration: string;
  source_of_income: string;
  education: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  consistent_in_wazaif: boolean;
  consistent_in_prayers: boolean;
  missed_prayers: string[];
  makes_up_missed_prayers: boolean;
  nawafil: number;
  can_read_quran: boolean;
  consistent_in_ishraq: boolean;
  consistent_in_tahajjud: boolean;
  amount_of_durood: number;
  listens_taleem_daily: boolean;
  last_wazaif_tarteeb: string;
  multan_visit_frequency: string;
  mehfil_attendance_frequency: string;
  household_members_in_ehad: number;
  reads_current_wazaif_with_ease: boolean;
  able_to_read_additional_wazaif: boolean;
  wazaif_consistency_duration: string;
  does_dum_taweez: boolean;
  kalimah_quantity: number;
  allah_quantity: number;
  laa_ilaaha_illallah_quantity: number;
  sallallahu_alayhi_wasallam_quantity: number;
  astagfirullah_quantity: number;
  ayat_ul_kursi_quantity: number;
  dua_e_talluq_quantity: number;
  subhanallah_quantity: number;
  dua_e_waswasey_quantity: number;
  other_wazaif: string;
  wazaif_not_reading: string;
  additional_wazaif_reading: string;
  issues_facing: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  zone?: {
    id: number;
    title_en: string;
  };
  mehfilDirectory?: {
    id: number;
    mehfil_number: string;
    name_en: string;
  };
}

export interface TarteebRequestListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: TarteebRequest[];
}

class TarteebRequestService {
  /**
   * Get all tarteeb requests with pagination and filters
   */
  async getAllTarteebRequests(
    page = 1,
    size = 10,
    search = '',
    zoneId?: number,
    mehfilDirectoryId?: number,
    statusFilter?: string
  ): Promise<TarteebRequestListResponse> {
    const response = await axios.get(`${API_URL}tarteeb-requests`, {
      params: { page, size, search, zoneId, mehfilDirectoryId, status: statusFilter },
    });
    return response.data;
  }

  /**
   * Get a single tarteeb request by ID
   */
  async getTarteebRequestById(id: number): Promise<TarteebRequest> {
    const response = await axios.get(`${API_URL}tarteeb-requests/${id}`);
    return response.data.data;
  }

  /**
   * Create a new tarteeb request
   */
  async createTarteebRequest(request: Partial<TarteebRequest>): Promise<TarteebRequest> {
    const response = await axios.post(`${API_URL}tarteeb-requests/add`, request);
    return response.data.data;
  }

  /**
   * Update a tarteeb request
   */
  async updateTarteebRequest(id: number, request: Partial<TarteebRequest>): Promise<TarteebRequest> {
    const response = await axios.put(`${API_URL}tarteeb-requests/update/${id}`, request);
    return response.data.data;
  }

  /**
   * Delete a tarteeb request
   */
  async deleteTarteebRequest(id: number): Promise<void> {
    await axios.delete(`${API_URL}tarteeb-requests/${id}`);
  }

  /**
   * Update status of a tarteeb request
   */
  async updateStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<TarteebRequest> {
    const response = await axios.patch(`${API_URL}tarteeb-requests/${id}/status`, { status });
    return response.data.data;
  }
}

export default new TarteebRequestService();


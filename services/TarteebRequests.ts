import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

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
  jawab?: string;
  notes?: string;
}

export interface TarteebRequestListResponse {
  success: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: TarteebRequest[];
}

interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  links?: Record<string, string | null>;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number | string;
    total?: number;
  };
}

export interface ZoneSummary {
  id: number;
  title_en: string;
  city_en?: string;
  country_en?: string;
}

export interface MehfilSummary {
  id: number;
  zone_id: number;
  mehfil_number: string;
  name_en: string;
  address_en?: string;
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
    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (search) {
      params.search = search;
    }

    if (typeof zoneId === 'number') {
      params.zone_id = zoneId;
    }

    if (typeof mehfilDirectoryId === 'number') {
      params.mehfil_directory_id = mehfilDirectoryId;
    }

    if (statusFilter && statusFilter !== 'all') {
      params.status = statusFilter;
    }

    const response = await axios.get<PaginatedResponse<TarteebRequest>>(
      `${API_URL}/tarteeb-requests`,
      {
        params,
      }
    );

    const { data = [], meta, success } = response.data;

    const totalItems = meta?.total ?? data.length;
    const perPage = typeof meta?.per_page === 'string' ? parseInt(meta.per_page, 10) : meta?.per_page ?? size;
    const totalPages = meta?.last_page ?? Math.max(1, Math.ceil(totalItems / (perPage || 1)));
    const currentPage = meta?.current_page ?? page;

    return {
      success: success ?? true,
      data,
      totalItems,
      totalPages,
      currentPage,
      pageSize: perPage,
    };
  }

  /**
   * Get a single tarteeb request by ID
   */
  async getTarteebRequestById(id: number): Promise<TarteebRequest> {
    const response = await axios.get<{ data: TarteebRequest }>(
      `${API_URL}/tarteeb-requests/${id}`
    );
    return response.data.data;
  }

  /**
   * Create a new tarteeb request
   */
  async createTarteebRequest(request: Partial<TarteebRequest>): Promise<TarteebRequest> {
    const response = await axios.post<{ data: TarteebRequest }>(
      `${API_URL}/tarteeb-requests/add`,
      request
    );
    return response.data.data;
  }

  /**
   * Update a tarteeb request
   */
  async updateTarteebRequest(id: number, request: Partial<TarteebRequest>): Promise<TarteebRequest> {
    const response = await axios.put<{ data: TarteebRequest }>(
      `${API_URL}/tarteeb-requests/update/${id}`,
      request
    );
    return response.data.data;
  }

  /**
   * Delete a tarteeb request
   */
  async deleteTarteebRequest(id: number): Promise<void> {
    await axios.delete(`${API_URL}/tarteeb-requests/${id}`);
  }

  /**
   * Update status of a tarteeb request
   */
  async updateStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<TarteebRequest> {
    const response = await axios.patch<{ data: TarteebRequest }>(
      `${API_URL}/tarteeb-requests/${id}/status`,
      { status }
    );
    return response.data.data;
  }

  async getZones(size = 200, search = ''): Promise<ZoneSummary[]> {
    const params: Record<string, string | number> = {
      size,
      page: 1,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get<PaginatedResponse<ZoneSummary>>(
      `${API_URL}/zone`,
      { params }
    );

    return response.data.data || [];
  }

  async getMehfilsByZone(zoneId: number, size = 200, search = ''): Promise<MehfilSummary[]> {
    const params: Record<string, string | number> = {
      size,
      page: 1,
      zoneId,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get<PaginatedResponse<MehfilSummary>>(
      `${API_URL}/mehfil-directory`,
      { params }
    );

    return response.data.data || [];
  }
}

export default new TarteebRequestService();


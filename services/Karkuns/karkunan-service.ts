export interface Karkunan {
  id: number;
  name: string;
  father_name: string;
  mobile_no: string;
  cnic_no?: string;
  address: string;
  birth_year: number;
  ehad_year: number;
  duty_days?: string[];
  duty_type?: string;
  zone: string;
  mehfile: string;
  profile_photo?: string;
  email?: string;
  user_type?: string;
  city?: string;
  country?: string;
  is_zone_admin?: boolean;
  is_mehfile_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KarkunanResponse {
  data: Karkunan[];
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface KarkunanQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface SingleKarkunanResponse {
  data: Karkunan;
}

export interface CreateKarkunanRequest {
  name: string;
  father_name: string;
  mobile_no: string;
  cnic_no?: string;
  address: string;
  birth_year: number;
  ehad_year: number;
  duty_days?: string[];
  duty_type?: string;
  zone: string;
  mehfile: string;
  email?: string;
  user_type?: string;
  city?: string;
  country?: string;
  password?: string;
  is_zone_admin?: boolean;
  is_mehfile_admin?: boolean;
}

export interface UpdateKarkunanRequest extends Partial<CreateKarkunanRequest> {
  id: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const karkunanService = {
  // Fetch all karkunan with pagination and search
  async fetchKarkunans(params?: KarkunanQueryParams): Promise<KarkunanResponse> {
    try {
      const url = new URL(`${API_BASE_URL}/karkun`);
      
      if (params) {
        if (params.page) url.searchParams.append('page', params.page.toString());
        if (params.size) url.searchParams.append('size', params.size.toString());
        if (params.search) url.searchParams.append('search', params.search);
      }

      console.log('🔍 Fetching karkunan from:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Karkunan fetched successfully:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching karkunan:', error);
      throw error;
    }
  },

  // Get karkunan by ID
  async fetchKarkunanById(id: number): Promise<SingleKarkunanResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/karkun/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching karkunan by ID:', error);
      throw error;
    }
  },

  // Create new karkunan
  async createKarkunan(karkunan: CreateKarkunanRequest): Promise<Karkunan> {
    try {
      console.log('🔍 Creating karkunan:', karkunan);
      
      const response = await fetch(`${API_BASE_URL}/karkun/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(karkunan),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Karkunan created successfully:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error creating karkunan:', error);
      throw error;
    }
  },

  // Update karkunan
  async updateKarkunan(id: number, karkunan: Partial<CreateKarkunanRequest>): Promise<Karkunan> {
    try {
      console.log('🔍 Updating karkunan:', { id, karkunan });
      
      const response = await fetch(`${API_BASE_URL}/karkun/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(karkunan),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Karkunan updated successfully:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error updating karkunan:', error);
      throw error;
    }
  },

  // Delete karkunan
  async deleteKarkunan(id: number): Promise<void> {
    try {
      console.log('🔍 Deleting karkunan:', id);
      
      const response = await fetch(`${API_BASE_URL}/karkun/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Karkunan deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting karkunan:', error);
      throw error;
    }
  },
}; 
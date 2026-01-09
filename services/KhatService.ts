import axios from "axios";
import {
  Khat,
  KhatStatus,
  KhatType,
  PaginatedKhatResponse,
  ZoneSummary,
  MehfilSummary,
} from "@/types/khat";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/+$/, "");

// Create axios instance with interceptor for auth token
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface KhatListResponse {
  success: boolean;
  data: Khat[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface KhatListFilters {
  page?: number;
  size?: number;
  search?: string;
  zoneId?: number;
  mehfilDirectoryId?: number;
  status?: KhatStatus | "";
  type?: KhatType | "";
  sortField?: "id" | "full_name" | "created_at" | "status" | "type";
  sortDirection?: "asc" | "desc";
}

class KhatService {
  private buildListResponse(
    response: PaginatedKhatResponse,
    fallbackPage: number,
    fallbackSize: number
  ): KhatListResponse {
    const { data = [], meta, success } = response;
    const totalItems = meta?.total ?? data.length;
    const perPage =
      typeof meta?.per_page === "string" ? parseInt(meta.per_page, 10) : meta?.per_page ?? fallbackSize;
    const totalPages = meta?.last_page ?? Math.max(1, Math.ceil(totalItems / (perPage || 1)));
    const currentPage = meta?.current_page ?? fallbackPage;

    return {
      success: success ?? true,
      data,
      totalItems,
      totalPages,
      currentPage,
      pageSize: perPage,
    };
  }

  async getKhats(filters: KhatListFilters = {}): Promise<KhatListResponse> {
    const {
      page = 1,
      size = 10,
      search,
      zoneId,
      mehfilDirectoryId,
      status,
      type,
      sortField,
      sortDirection,
    } = filters;

    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (search) params.search = search;
    if (typeof zoneId === "number") params.zone_id = zoneId;
    if (typeof mehfilDirectoryId === "number") params.mehfil_directory_id = mehfilDirectoryId;
    if (status) params.status = status;
    if (type) params.type = type;
    if (sortField) params.sortField = sortField;
    if (sortDirection) params.sortDirection = sortDirection;

    const response = await apiClient.get<PaginatedKhatResponse>(`/khat`, { params });
    return this.buildListResponse(response.data, page, size);
  }

  async getKhatById(id: number): Promise<Khat> {
    const response = await apiClient.get<{ data: Khat }>(`/khat/${id}`);
    return response.data.data;
  }

  async createKhat(payload: Partial<Khat>): Promise<Khat> {
    const response = await apiClient.post<{ data: Khat }>(`/khat/add`, payload);
    return response.data.data;
  }

  async updateKhat(id: number, payload: Partial<Khat>): Promise<void> {
    await apiClient.put(`/khat/update/${id}`, payload);
  }

  async deleteKhat(id: number): Promise<void> {
    await apiClient.delete(`/khat/${id}`);
  }

  async updateStatus(id: number, status: KhatStatus): Promise<void> {
    await apiClient.patch(`/khat/${id}/status`, { status });
  }

  async generatePublicLink(
    linkExpiryHours: number,
    zoneId?: number,
    mehfilDirectoryId?: number
  ): Promise<{ token: string; url: string; expires_at: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { token: string; url: string; expires_at: string };
    }>("/khat/generate-public-link", {
      linkExpiryHours,
      zone_id: zoneId,
      mehfil_directory_id: mehfilDirectoryId,
    });
    return response.data.data;
  }

  async validateToken(token: string): Promise<{
    success: boolean;
    valid: boolean;
    message?: string;
    data?: {
      zone_id?: number;
      mehfil_directory_id?: number;
      created_by?: number;
    };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      valid: boolean;
      message?: string;
      data?: {
        zone_id?: number;
        mehfil_directory_id?: number;
        created_by?: number;
      };
    }>(`/khat/validate-token/${token}`);
    return response.data;
  }

  async getZones(size = 200, search = ""): Promise<ZoneSummary[]> {
    const params: Record<string, string | number> = {
      size,
      page: 1,
    };

    if (search) params.search = search;

    const response = await axios.get<{ data: ZoneSummary[] }>(`${API_URL}/zone`, { params });
    return response.data.data || [];
  }

  async getMehfilsByZone(zoneId: number, size = 200): Promise<MehfilSummary[]> {
    const params: Record<string, string | number> = {
      size,
      page: 1,
      zoneId,
    };

    const response = await axios.get<{ data: MehfilSummary[] }>(`${API_URL}/mehfil-directory`, {
      params,
    });
    return response.data.data || [];
  }
}

export default new KhatService();



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

    const response = await axios.get<PaginatedKhatResponse>(`${API_URL}/khat`, { params });
    return this.buildListResponse(response.data, page, size);
  }

  async getKhatById(id: number): Promise<Khat> {
    const response = await axios.get<{ data: Khat }>(`${API_URL}/khat/${id}`);
    return response.data.data;
  }

  async createKhat(payload: Partial<Khat>): Promise<Khat> {
    const response = await axios.post<{ data: Khat }>(`${API_URL}/khat/add`, payload);
    return response.data.data;
  }

  async updateKhat(id: number, payload: Partial<Khat>): Promise<void> {
    await axios.put(`${API_URL}/khat/update/${id}`, payload);
  }

  async deleteKhat(id: number): Promise<void> {
    await axios.delete(`${API_URL}/khat/${id}`);
  }

  async updateStatus(id: number, status: KhatStatus): Promise<void> {
    await axios.patch(`${API_URL}/khat/${id}/status`, { status });
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



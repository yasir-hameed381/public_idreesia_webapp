import axios from "axios";

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

export interface ResponseTemplate {
  id: number;
  title: string;
  jawab?: string;
  jawab_links?: Array<{ title: string; url: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface ResponseTemplateListResponse {
  success: boolean;
  data: ResponseTemplate[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: any;
}

export interface ResponseTemplateListFilters {
  page?: number;
  size?: number;
  search?: string;
  sortField?: "id" | "title" | "created_at" | "updated_at";
  sortDirection?: "asc" | "desc";
}

class ResponseTemplatesService {
  private buildListResponse(
    response: ResponseTemplateListResponse,
    fallbackPage: number,
    fallbackSize: number
  ) {
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

  async getResponseTemplates(filters: ResponseTemplateListFilters = {}) {
    const {
      page = 1,
      size = 10,
      search,
      sortField,
      sortDirection,
    } = filters;

    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (search) params.search = search;
    if (sortField) params.sortField = sortField;
    if (sortDirection) params.sortDirection = sortDirection;

    const response = await apiClient.get<ResponseTemplateListResponse>(`/response-templates`, { params });
    return this.buildListResponse(response.data, page, size);
  }

  async getResponseTemplateById(id: number): Promise<ResponseTemplate> {
    const response = await apiClient.get<{ success: boolean; data: ResponseTemplate }>(
      `/response-templates/${id}`
    );
    return response.data.data;
  }

  async createResponseTemplate(payload: Partial<ResponseTemplate>): Promise<ResponseTemplate> {
    const response = await apiClient.post<{ success: boolean; data: ResponseTemplate }>(
      `/response-templates/add`,
      payload
    );
    return response.data.data;
  }

  async updateResponseTemplate(
    id: number,
    payload: Partial<ResponseTemplate>
  ): Promise<ResponseTemplate> {
    const response = await apiClient.put<{ success: boolean; data: ResponseTemplate }>(
      `/response-templates/update/${id}`,
      payload
    );
    return response.data.data;
  }

  async deleteResponseTemplate(id: number): Promise<void> {
    await apiClient.delete(`/response-templates/${id}`);
  }
}

export default new ResponseTemplatesService();


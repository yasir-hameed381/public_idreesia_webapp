const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("auth-token") ||
    sessionStorage.getItem("auth-token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface Region {
  id: number;
  name: string;
  description?: string;
  co?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegionListResponse {
  data: Region[];
  links?: any;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export class RegionService {
  // Get all regions
  static async getAll(params?: {
    page?: number;
    size?: number;
    search?: string;
    sortField?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<RegionListResponse> {
    try {
      const url = new URL(`${API_BASE_URL}/region`);
      if (params?.page) url.searchParams.append("page", params.page.toString());
      if (params?.size) url.searchParams.append("size", params.size.toString());
      if (params?.search) url.searchParams.append("search", params.search);
      if (params?.sortField) url.searchParams.append("sortField", params.sortField);
      if (params?.sortDirection) url.searchParams.append("sortDirection", params.sortDirection);

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch regions: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();

      if (!text) {
        return { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
      }

      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  }

  // Get single region
  static async getById(id: number): Promise<Region> {
    try {
      const response = await fetch(`${API_BASE_URL}/region/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch region: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      try {
        const data = JSON.parse(text);
        return data.data;
      } catch (error) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error fetching region:", error);
      throw error;
    }
  }

  // Create new region
  static async create(regionData: {
    name: string;
    description?: string;
    co?: string;
    primaryPhoneNumber?: string;
    secondaryPhoneNumber?: string;
  }): Promise<Region> {
    try {
      const response = await fetch(`${API_BASE_URL}/region/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(regionData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create region: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error creating region:", error);
      throw error;
    }
  }

  // Update region
  static async update(
    id: number,
    regionData: {
      name: string;
      description?: string;
      co?: string;
      primaryPhoneNumber?: string;
      secondaryPhoneNumber?: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/region/update/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(regionData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update region: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error updating region:", error);
      throw error;
    }
  }

  // Delete region
  static async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/region/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete region: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error deleting region:", error);
      throw error;
    }
  }
}


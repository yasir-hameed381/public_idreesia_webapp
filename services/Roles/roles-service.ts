import { Role, CreateRoleRequest, UpdateRoleRequest } from "@/types/Role";
import { Permission } from "@/types/permission";

interface ApiResponse {
  data: Role[];
  meta?: {
    total: number;
  };
}

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

export const fetchRoles = async (params?: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<ApiResponse> => {
  try {
    const url = new URL(`${API_BASE_URL}/role`);

    if (params?.page) url.searchParams.append("page", params.page.toString());
    if (params?.size) url.searchParams.append("size", params.size.toString());
    if (params?.search) url.searchParams.append("search", params.search);

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch roles: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Check if response has content
    const text = await response.text();

    if (!text) {
      return { data: [], meta: { total: 0 } };
    }

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("Error in fetchRoles:", error);
    throw error;
  }
};

export const deleteRole = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/role/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete role: ${response.status} ${response.statusText}`
    );
  }
};

export const fetchRoleById = async (id: number): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/role/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch role: ${response.status} ${response.statusText}`
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
};

export const fetchPermissions = async (): Promise<{ data: Permission[] }> => {
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch permissions: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  if (!text) {
    return { data: [] };
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Invalid JSON response from server");
  }
};

export const getRoleById = async (id: number): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/role/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch role: ${response.status} ${response.statusText}`
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
};

export const createRole = async (
  roleData: Omit<Role, "id" | "created_at" | "updated_at">
): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/role/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create role: ${response.status} ${response.statusText}`
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
};

export const updateRole = async (
  id: number,
  roleData: Partial<Role>
): Promise<Role> => {
  const response = await fetch(`${API_BASE_URL}/role/update/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update role: ${response.status} ${response.statusText}`
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
};

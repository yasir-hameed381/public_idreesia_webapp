import axios from "axios";
import { Permission, Role } from "@/types/permission";

// API base configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const permissionsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
permissionsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateRoleRequest {
  name: string;
  guard_name?: string;
  permissions: number[];
}

export interface UpdateRoleRequest {
  id: number;
  name: string;
  guard_name?: string;
  permissions: number[];
}

export interface RoleResponse {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface PermissionResponse {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export const permissionsService = {
  // Get all permissions
  async getPermissions(): Promise<PermissionResponse[]> {
    try {
      const response = await permissionsApi.get("/permissions");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  },

  // Fetch permissions with pagination (for role form)
  async fetchPermissions(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{
    data: PermissionResponse[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }> {
    try {
      const response = await permissionsApi.get("/permissions", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch permissions"
      );
    }
  },

  // Get all roles with pagination
  async getRoles(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{
    data: RoleResponse[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }> {
    try {
      const response = await permissionsApi.get("/roles", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch roles");
    }
  },

  // Get role by ID
  async getRoleById(id: number): Promise<RoleResponse> {
    try {
      const response = await permissionsApi.get(`/roles/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch role");
    }
  },

  // Create new role
  async createRole(roleData: CreateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await permissionsApi.post("/roles", roleData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create role");
    }
  },

  // Update role
  async updateRole(roleData: UpdateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await permissionsApi.put(
        `/roles/${roleData.id}`,
        roleData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update role");
    }
  },

  // Delete role
  async deleteRole(id: number): Promise<void> {
    try {
      await permissionsApi.delete(`/roles/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete role");
    }
  },

  // Assign role to user
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    try {
      await permissionsApi.post(`/admin-users/${userId}/assign-role`, {
        role_id: roleId,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to assign role to user"
      );
    }
  },

  // Remove role from user
  async removeRoleFromUser(userId: number): Promise<void> {
    try {
      await permissionsApi.delete(`/admin-users/${userId}/remove-role`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove role from user"
      );
    }
  },

  // Get user permissions
  async getUserPermissions(userId: number): Promise<PermissionResponse[]> {
    try {
      const response = await permissionsApi.get(
        `/admin-users/${userId}/permissions`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user permissions"
      );
    }
  },

  // Check if user has specific permission
  async checkUserPermission(
    userId: number,
    permissionName: string
  ): Promise<boolean> {
    try {
      const response = await permissionsApi.get(
        `/admin-users/${userId}/check-permission`,
        {
          params: { permission: permissionName },
        }
      );
      return response.data.has_permission;
    } catch (error: any) {
      return false;
    }
  },

  // Get all permissions grouped by category
  getPermissionsByCategory(): Record<string, string[]> {
    // This would typically come from the backend, but for now we'll group them manually
    const categories = {
      "User Management": [
        "view-users",
        "create-users",
        "edit-users",
        "delete-users",
      ],
      "Role Management": [
        "view-roles",
        "create-roles",
        "edit-roles",
        "delete-roles",
      ],
      "Permission Management": ["view-permissions", "assign-permissions"],
      "Content Management": [
        "view-content",
        "create-content",
        "edit-content",
        "delete-content",
      ],
      "Mehfil Management": [
        "view-mehfils",
        "create-mehfils",
        "edit-mehfils",
        "delete-mehfils",
      ],
      "Karkun Management": [
        "view-karkuns",
        "create-karkuns",
        "edit-karkuns",
        "delete-karkuns",
      ],
      "Zone Management": [
        "view-zones",
        "create-zones",
        "edit-zones",
        "delete-zones",
      ],
      Reports: ["view-reports", "generate-reports"],
      Settings: ["view-settings", "edit-settings"],
    };

    return categories;
  },

  // Validate permission name format
  validatePermissionName(name: string): boolean {
    const permissionPattern = /^[a-z-]+$/;
    return permissionPattern.test(name) && name.length >= 3;
  },

  // Generate permission name from display name
  generatePermissionName(displayName: string, action: string): string {
    const cleanName = displayName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `${action}-${cleanName}`;
  },
};

export default permissionsService;

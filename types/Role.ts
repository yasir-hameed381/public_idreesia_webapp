import { Permission } from './permission';

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface RoleResponse {
  data: Role[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface CreateRoleRequest {
  name: string;
  permissions: number[]; // Array of permission IDs
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: number[]; // Array of permission IDs
} 
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface AdminUser {
  id: number;
  zone_id: number | null;
  name: string;
  name_ur: string | null;
  email: string;
  father_name: string | null;
  father_name_ur: string | null;
  phone_number: string | null;
  id_card_number: string | null;
  address: string | null;
  birth_year: number | null;
  ehad_year: number | null;
  mehfil_directory_id: number | null;
  duty_days: string | null;
  duty_type: string | null;
  avatar: string;
  city: string | null;
  country: string | null;
  is_zone_admin: boolean;
  is_mehfil_admin: boolean;
  is_super_admin: boolean;
  is_region_admin?: boolean;
  is_all_region_admin?: boolean;
  role_id: number | null;
  user_type: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserResponse {
  data: AdminUser[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: string;
    to: number;
    total: number;
  };
}

export interface AdminUserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export const adminUserApi = createApi({
  reducerPath: "adminUserApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["AdminUser"],
  endpoints: (builder) => ({
    fetchAdminUsers: builder.query<AdminUserResponse, AdminUserQueryParams>({
      query: ({ page = 1, size = 10, search = "", sortField, sortDirection }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        if (sortField) {
          params.append("sortField", sortField);
        }

        if (sortDirection) {
          params.append("sortDirection", sortDirection);
        }

        return `adminusers?${params.toString()}`;
      },
      providesTags: ["AdminUser"],
    }),
    fetchAdminUserById: builder.query<{ data: AdminUser }, number>({
      query: (id) => `adminusers/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),
    addAdminUser: builder.mutation<AdminUser, Partial<AdminUser>>({
      query: (body) => ({
        url: "adminusers/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUser"],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: number; data: Partial<AdminUser> }>({
      query: ({ id, data }) => ({
        url: `adminusers/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminUser"],
    }),
    deleteAdminUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `adminusers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUser"],
    }),
  }),
});

export const {
  useFetchAdminUsersQuery,
  useFetchAdminUserByIdQuery,
  useAddAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminUserApi;

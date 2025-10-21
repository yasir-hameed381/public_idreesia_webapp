import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';
import { Category } from "@/app/types/category";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    debouncedSearch: string;
  };
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/categories`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    getCategories: builder.query<PaginatedResponse<Category>, { page: number; size: number; search?: string; debouncedSearch?: string; }>({
      query: ({ page, size, search = "" }) => `?page=${page}&size=${size}&search=${search}`,
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<Category, Omit<Category, "id" | "created_at" | "updated_at">>({
      query: (data) => ({
        url: "/add",
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<Category, { id: number; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
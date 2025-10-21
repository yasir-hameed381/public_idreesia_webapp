import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';
import { Tag } from "@/app/types/tag";

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

export const tagApi = createApi({
  reducerPath: "tagApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/tags`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Tags"],
  endpoints: (builder) => ({
    getTags: builder.query<PaginatedResponse<Tag>, { page: number; size: number; search?: string; debouncedSearch?: string; }>({
      query: ({ page, size, search = "", debouncedSearch = "" }) => 
        `?page=${page}&size=${size}&search=${search}&debouncedSearch=${debouncedSearch}`,
      providesTags: ["Tags"],
    }),

    createTag: builder.mutation<Tag, Omit<Tag, "tag_id" | "created_at" | "updated_at">>({
      query: (data) => ({
        url: "/add",
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Tags"],
    }),

    updateTag: builder.mutation<Tag, { tag_id: number; data: Partial<Tag> }>({
      query: ({ tag_id, data }) => ({
        url: `/update/${tag_id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Tags"]
    }),

    deleteTag: builder.mutation<{ success: boolean }, number>({
      query: (tag_id) => ({
        url: `/${tag_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tags"],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
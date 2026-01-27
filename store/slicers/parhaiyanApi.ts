import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Parhaiyan } from "@/app/types/Parhaiyan";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    // debouncedSearch?: string;
  };
}

export const parhaiyanApi = createApi({
  reducerPath: "parhaiyanApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Parhaiyan"],
  endpoints: (builder) => ({
    // GET
    getParhaiyan: builder.query<PaginatedResponse<Parhaiyan>, {
      page: number;
      size: number;
      search?: string;
    }>({
      query: ({ page, size, search = "" }) =>
        `/parhaiyan?page=${page}&size=${size}&search=${search}`,
      providesTags: ["Parhaiyan"],
    }),

    // GET BY ID - Using the list endpoint and filtering client-side
    getParhaiyanById: builder.query<{ data: Parhaiyan | null }, string>({
      query: (id) => `/parhaiyan?page=1&size=1000`,
      transformResponse: (response: PaginatedResponse<Parhaiyan>, meta, arg) => {
        const parhaiyan = response.data.find(item => item.id?.toString() === arg);
        return {
          data: parhaiyan || null,
        };
      },
      providesTags: (result, error, id) => [{ type: "Parhaiyan", id }],
    }),

    // GET BY SLUG - Public endpoint for fetching parhaiyan by slug (no auth required)
    getParhaiyanBySlug: builder.query<{ success: boolean; data: Parhaiyan | null }, string>({
      query: (slug) => `/parhaiyan/slug/${slug}`,
      transformResponse: (response: { success: boolean; data: Parhaiyan }) => {
        return {
          success: response.success,
          data: response.data || null,
        };
      },
      providesTags: (result, error, slug) => [{ type: "Parhaiyan", id: `SLUG-${slug}` }],
    }),

    // CREATE
    createParhaiyan: builder.mutation<Parhaiyan, Omit<Parhaiyan, "id" | "created_at" | "updated_at">>({
      query: (data) => ({
        url: "/parhaiyan/add",
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Parhaiyan"],
    }),

    // UPDATE
    updateParhaiyan: builder.mutation<Parhaiyan, { id: number; data: Partial<Parhaiyan> }>({
      query: ({ id, data }) => ({
        url: `/parhaiyan/update/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Parhaiyan"],
    }),

    // DELETE
    deleteParhaiyan: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/parhaiyan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Parhaiyan"],
    }),

    // GET RECITATIONS BY PARHAIYAN ID
    getParhaiyanRecitations: builder.query<
      PaginatedResponse<any>,
      {
        parhaiyan_id: number;
        page: number;
        size: number;
        search?: string;
      }
    >({
      query: ({ parhaiyan_id, page, size, search = "" }) => {
        return `/parhaiyan-recitations?page=${page}&size=${size}&search=${search}&parhaiyan_id=${parhaiyan_id}`;
      },
      providesTags: (result, error, arg) => [
        { type: "Parhaiyan", id: `RECITATIONS-${arg.parhaiyan_id}` },
      ],
    }),

    // DELETE RECITATION
    deleteRecitation: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/parhaiyan-recitations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Parhaiyan"],
    }),
  }),
});

export const {
  useGetParhaiyanQuery,
  useGetParhaiyanByIdQuery,
  useGetParhaiyanBySlugQuery,
  useCreateParhaiyanMutation,
  useUpdateParhaiyanMutation,
  useDeleteParhaiyanMutation,
  useGetParhaiyanRecitationsQuery,
  useDeleteRecitationMutation,
} = parhaiyanApi;

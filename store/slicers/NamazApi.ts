import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface Namaz {
  id: number;
  fajr: string;
  dhuhr: string;
  jumma: string;
  asr: string;
  maghrib: string;
  isha: string;
  description_en: string | null;
  description_ur: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export const namazApi = createApi({
  reducerPath: "namazApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Namaz"],
  endpoints: (builder) => ({
    // GET all Namaz times
    getNamaz: builder.query<PaginatedResponse<Namaz>, {
      page: number;
      size: number;
      search?: string;
    }>({
      query: ({ page, size, search = "" }) =>
        `/namaz?page=${page}&size=${size}&search=${search}`,
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Namaz' as const, id })),
              { type: 'Namaz' as const, id: 'LIST' },
            ]
          : [{ type: 'Namaz' as const, id: 'LIST' }],
      keepUnusedDataFor: 0, // Don't cache data - always fetch fresh
    }),

    // CREATE new Namaz time
    createNamaz: builder.mutation<Namaz, Omit<Namaz, "id" | "created_by" | "updated_by" | "created_at" | "updated_at">>({
      query: (data) => ({
        url: "/namaz/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Namaz"],
    }),

    // UPDATE existing Namaz time
    updateNamaz: builder.mutation<
      Namaz, 
      { 
        id: number; 
        data: {
          fajr: string;
          dhuhr: string;
          jumma: string;
          asr: string;
          maghrib: string;
          isha: string;
          description_en?: string | null;
          description_ur?: string | null;
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/namaz/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Namaz"],
    }),

    // DELETE Namaz time
    deleteNamaz: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/namaz/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Namaz"],
    }),
  }),
});

export const {
  useGetNamazQuery,
  useCreateNamazMutation,
  useUpdateNamazMutation,
  useDeleteNamazMutation,
} = namazApi;
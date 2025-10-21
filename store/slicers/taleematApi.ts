import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

// Define Taleemat interface
export interface Taleemat {
  id: string;
  title_en: string;
  title_ur: string;
  description: string;
  track: string;
  tags: string;
  filename: string;
  category_id: number;
  is_published: number;
  filepath: string;
  slug: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

// Define API response interface
interface TaleematResponse {
  data: Taleemat[];
  meta: {
    total: number;
  };
  size: number;
}

// Params interface for fetching taleemat
interface FetchTaleematParams {
  page: number;
  size: number;
  search?: string;
  category?: string;
}

// RTK Query API definition
export const taleematApi = createApi({
  reducerPath: 'taleematApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Taleemat'],
  endpoints: (builder) => ({
    // Get all taleemat with pagination, search and category filtering
    getTaleemat: builder.query<TaleematResponse, FetchTaleematParams>({
      query: ({ page, size, search = '', category = 'all' }) => 
        `/taleemat-data?page=${page}&size=${size}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Taleemat' as const, id })),
              { type: 'Taleemat', id: 'LIST' },
            ]
          : [{ type: 'Taleemat', id: 'LIST' }],
    }),
    
    // Get taleemat by ID
    getTaleematById: builder.query<Taleemat, string>({
      query: (id) => `/taleemat-data/${id}`,
      providesTags: (result, error, id) => [{ type: 'Taleemat', id }],
    }),
    
    // Add new taleemat
    addTaleemat: builder.mutation<Taleemat, Omit<Taleemat, "id">>({
      query: (taleemat) => ({
        url: '/taleemat-data/add',
        method: 'POST',
        body: {
          ...taleemat,
          created_by: 1, // Static user ID for creation
          created_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: 'Taleemat', id: 'LIST' }],
    }),
    
    // Update existing taleemat
    updateTaleemat: builder.mutation<Taleemat, Taleemat>({
      query: (taleemat) => ({
        url: `/taleemat-data/update/${taleemat.id}`,
        method: 'PUT',
        body: {
          ...taleemat,
          updated_by: 1, // Static user ID for updates
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Taleemat', id },
        { type: 'Taleemat', id: 'LIST' }
      ],
    }),
    
    // Delete taleemat
    deleteTaleemat: builder.mutation<void, string>({
      query: (id) => ({
        url: `/taleemat-data/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Taleemat', id },
        { type: 'Taleemat', id: 'LIST' }
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTaleematQuery,
  useGetTaleematByIdQuery,
  useAddTaleematMutation,
  useUpdateTaleematMutation,
  useDeleteTaleematMutation,
} = taleematApi;
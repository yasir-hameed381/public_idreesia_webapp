import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface NaatSharifData {
  id: number;
  title: string;
  description: string;
  filepath?: string;
  created_at: string;
  type?: string;
  track?: string;
  title_ur?: string;
  title_en?: string;
  description_en?: string;
  description_ur?: string;
  category?: string;
  published?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface NaatSharifResponse {
  data: NaatSharifData[];
  meta: {
    total: number;
  };
  size: number;
}

interface NaatSharifQueryParams {
  page: number;
  size: number;
  search: string;
  category?: string;
}

// Valid category values based on the error message
export const VALID_CATEGORIES = ['all', 2, 3];

export const naatsharifApi = createApi({
  reducerPath: 'naatsharifApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['NaatSharif'],
  endpoints: (builder) => ({
    fetchNaatSharifData: builder.query<NaatSharifResponse, NaatSharifQueryParams>({
      query: ({ page, size, search = "", category = "" }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(size));
        params.set("search", String(search));
        params.set("category", String(category));
        return `naatshareefs-data?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        
        if (!response || !response.data) {
          if (Array.isArray(response)) {
            return {
              data: response,
              meta: {
                total: response.length
              },
              size: 10
            };
          }
          
          return {
            data: [],
            meta: {
              total: 0
            },
            size: 10
          };
        }
        
        return response;
      },
      providesTags: (result) => 
        result?.data 
          ? [
              ...result.data.map(item => ({ type: 'NaatSharif' as const, id: item.id })),
              { type: 'NaatSharif', id: 'LIST' }
            ]
          : [{ type: 'NaatSharif', id: 'LIST' }],
    }),
    getNaatSharifById: builder.query<NaatSharifData, number>({
      query: (id) => `naatshareefs-data/${id}`,
      transformResponse: (response: any) => {
        console.log('Get by ID response:', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'NaatSharif', id }],
    }),
    createNaatSharif: builder.mutation<NaatSharifData, Partial<NaatSharifData>>({
      query: (body) => ({
        url: 'naatshareefs-data/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'NaatSharif', id: 'LIST' }],
    }),
    updateNaatSharif: builder.mutation<NaatSharifData, Partial<NaatSharifData>>({
      query: ({ id, ...patch }) => ({
        url: `naatshareefs-data/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'NaatSharif', id },
        { type: 'NaatSharif', id: 'LIST' },
      ],
    }),
    deleteNaatSharif: builder.mutation<void, number>({
      query: (id) => ({
        url: `naatshareefs-data/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'NaatSharif', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetchNaatSharifDataQuery,
  useGetNaatSharifByIdQuery,
  useCreateNaatSharifMutation,
  useUpdateNaatSharifMutation,
  useDeleteNaatSharifMutation,
} = naatsharifApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface KarkunJoinRequestData {
  id: number;
  avatar?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  birth_year: string;
  ehad_year: string;
  zone_id: number;
  city: string;
  country: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

interface KarkunJoinRequestResponse {
  data: KarkunJoinRequestData[];
  meta: {
    total: number;
  };
  size: number;
}

interface KarkunJoinRequestQueryParams {
  page: number;
  size: number;
  search: string;
  user_type?: string;
  is_approved?: boolean;
}

// Valid user types
export const VALID_USER_TYPES = ['student', 'teacher', 'admin', 'all'];

export const karkunJoinRequestsApi = createApi({
  reducerPath: 'karkunJoinRequestsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['KarkunJoinRequest'],
  endpoints: (builder) => ({
    fetchKarkunJoinRequestsData: builder.query<KarkunJoinRequestResponse, KarkunJoinRequestQueryParams>({
      query: ({ page, size, search, user_type, is_approved }) => {
        // Validate the user_type parameter
        const validUserType = user_type && VALID_USER_TYPES.includes(user_type) 
        ? user_type 
        : 'all';
        
        let queryString = `karkun-join-requests?page=${page}&size=${size}&search=${search}&user_type=${validUserType}`;
        
        if (is_approved !== undefined) {
          queryString += `&is_approved=${is_approved}`;
        }
        
        return queryString;
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
              ...result.data.map(item => ({ type: 'KarkunJoinRequest' as const, id: item.id })),
              { type: 'KarkunJoinRequest', id: 'LIST' }
            ]
          : [{ type: 'KarkunJoinRequest', id: 'LIST' }],
    }),
    getKarkunJoinRequestById: builder.query<KarkunJoinRequestData, number>({
      query: (id) => `karkun-join-requests/${id}`,
      transformResponse: (response: any) => {
        console.log('Get karkun join request by ID response:', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'KarkunJoinRequest', id }],
    }),
    createKarkunJoinRequest: builder.mutation<KarkunJoinRequestData, Partial<KarkunJoinRequestData>>({
      query: (body) => ({
        url: 'karkun-join-requests/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'KarkunJoinRequest', id: 'LIST' }],
    }),
    updateKarkunJoinRequest: builder.mutation<KarkunJoinRequestData, Partial<KarkunJoinRequestData>>({
      query: ({ id, ...patch }) => ({
        url: `karkun-join-requests/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'KarkunJoinRequest', id },
        { type: 'KarkunJoinRequest', id: 'LIST' },
      ],
    }),
    deleteKarkunJoinRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `karkun-join-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'KarkunJoinRequest', id: 'LIST' }],
    }),
    approveKarkunJoinRequest: builder.mutation<KarkunJoinRequestData, { id: number; is_approved: boolean }>({
      query: ({ id, is_approved }) => ({
        url: `karkun-join-requests/update/${id}`,
        method: 'PUT',
        body: { is_approved },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'KarkunJoinRequest', id },
        { type: 'KarkunJoinRequest', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useFetchKarkunJoinRequestsDataQuery,
  useGetKarkunJoinRequestByIdQuery,
  useCreateKarkunJoinRequestMutation,
  useUpdateKarkunJoinRequestMutation,
  useDeleteKarkunJoinRequestMutation,
  useApproveKarkunJoinRequestMutation,
} = karkunJoinRequestsApi;

// Alias for backward compatibility with existing code
export const useGetKarkunJoinRequestsQuery = useFetchKarkunJoinRequestsDataQuery;

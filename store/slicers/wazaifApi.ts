import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';
import { WazaifResponse, Wazaif } from "../../app/types/wazif"

export const wazaifApi = createApi({
  reducerPath: 'wazaifApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Wazaif'],
  endpoints: (builder) => ({
    getWazaif: builder.query<WazaifResponse, { page: number; size: number; search?: string }>({
      query: ({ page, size, search }) => {
        let url = `/wazaifs-data?page=${page}&size=${size}`;
        if (search && search.trim() !== '') {
          url += `&search=${encodeURIComponent(search)}`;
        }
        return url;
      },
      providesTags: ['Wazaif'],
    }),

    createWazaif: builder.mutation<Wazaif, Partial<Wazaif>>({
      query: (newWazaif) => ({
        url: '/wazaifs-data/add',
        method: 'POST',
        body: newWazaif,
      }),
      invalidatesTags: ['Wazaif'],
    }),
    updateWazaif: builder.mutation<Wazaif, Partial<Wazaif>>({
      query: ({ id, ...rest }) => ({
        url: `/wazaifs-data/update/${id}`,
        method: 'PUT',
        body: rest,
      }),
      invalidatesTags: ['Wazaif'],
    }),
    deleteWazaif: builder.mutation<void, number>({
      query: (id) => ({
        url: `/wazaifs-data/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wazaif'],
    }),
  }),
});

export const {
  useGetWazaifQuery,
  useCreateWazaifMutation,
  useUpdateWazaifMutation,
  useDeleteWazaifMutation,
} = wazaifApi;
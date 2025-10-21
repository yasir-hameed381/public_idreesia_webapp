

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface Zone {
  secondary_phone_number: string;
  primary_phone_number: string;
  ceo: string;
  city_ur: string;
  city_en: string;
  country_ur: string;
  description: string;
  id: string;
  title_en: string;
  title_ur: string;
  date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ZoneResponse {
  data: Zone[];
  meta: {
    total: number;
  };
}

interface ZoneQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}
interface SingleZoneResponse {
  data: Zone;
}
export const zoneSlice = createApi({
  reducerPath: 'zoneslice',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['zone'],
  endpoints: (builder) => ({
    addZone: builder.mutation<Zone, Partial<Zone>>({
      query: (body) => ({
        url: '/zone/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['zone'],
    }),

    updateZone: builder.mutation<Zone, Partial<Zone> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/zone/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['zone'],
    }),

    Deletezone: builder.mutation<void, string>({
      query: (id) => ({
        url: `zone/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['zone'],
    }),

    fetchZones: builder.query<ZoneResponse, ZoneQueryParams>({
      query: ({ page = 1, per_page = 5, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('size', per_page.toString());
        if (search) params.set('search', search);

        return `zone?${params.toString()}`;
      },
      providesTags: ['zone'],
    }),

    getZoneById: builder.query<SingleZoneResponse, string>({
      query: (id) => `zone/${id}`,
      providesTags: (result, error, id) => [{ type: 'zone', id }],
    }),
  }),
  
    

});

export const {
  useAddZoneMutation,
  useUpdateZoneMutation,
  useDeletezoneMutation, 
  useFetchZonesQuery,
  useGetZoneByIdQuery
} = zoneSlice;

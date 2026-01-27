
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface Karkun {
  id: number;
  zone_id: number;
  name_en: string;
  name_ur: string;
  so_en: string;
  so_ur: string;
  mobile_no: string;
  cnic: string;
  city_en: string;
  city_ur: string;
  country_en: string;
  country_ur: string;
  birth_year: number | null;
  ehad_year: number | null;
  ehad_ijazat_year: number | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface KarkunResponse {
  data: Karkun[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface KarkunQueryParams {
  page?: number;
  size?: number;
  search?: string;
  zone_id?: string | number | null;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface SingleKarkunResponse {
  data: Karkun;
}

export const karkunApi = createApi({
  reducerPath: 'karkunApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['karkun'],
  endpoints: (builder) => ({
    addKarkun: builder.mutation<Karkun, Partial<Karkun>>({
      query: (body) => ({
        url: 'ehadKarkun/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['karkun'],
    }),

    updateKarkun: builder.mutation<Karkun, Partial<Karkun> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `ehadKarkun/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['karkun'],
    }),

    deleteKarkun: builder.mutation<void, number>({
      query: (id) => ({
        url: `ehadKarkun/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['karkun'],
    }),

    fetchKarkuns: builder.query<KarkunResponse, KarkunQueryParams>({
      query: ({ page = 1, size = 5, search = '', zone_id = null, sortField, sortDirection }) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('size', size.toString());
        if (search) params.set('search', search);
        if (zone_id) params.set('zone_id', zone_id.toString());
        if (sortField) params.set('sortField', sortField);
        if (sortDirection) params.set('sortDirection', sortDirection);
        return `ehadKarkun?${params.toString()}`;
      },
      providesTags: ['karkun'],
    }),

    getKarkunById: builder.query<SingleKarkunResponse, number>({
      query: (id) => `ehadKarkun/${id}`,
      providesTags: (result, error, id) => [{ type: 'karkun', id }],
    }),
  }),
});

export const {
  useAddKarkunMutation,
  useUpdateKarkunMutation,
  useDeleteKarkunMutation,
  useFetchKarkunsQuery,
  useGetKarkunByIdQuery,
} = karkunApi;

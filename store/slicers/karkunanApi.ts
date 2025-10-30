import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface Karkunan {
  id: number;
  name: string;
  father_name: string;
  mobile_no: string;
  cnic_no?: string;
  address: string;
  birth_year: number;
  ehad_year: number;
  duty_days?: string[];
  duty_type?: string;
  zone: string;
  mehfile: string;
  profile_photo?: string;
  email?: string;
  user_type?: string;
  city?: string;
  country?: string;
  is_zone_admin?: boolean;
  is_mehfile_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface KarkunanResponse {
  data: Karkunan[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface KarkunanQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export const karkunanApi = createApi({
  reducerPath: "karkunanApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Karkunan"],
  endpoints: (builder) => ({
    fetchKarkunans: builder.query<KarkunanResponse, KarkunanQueryParams>({
      query: ({ page = 1, size = 10, search = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        return `karkun?${params.toString()}`;
      },
      providesTags: ["Karkunan"],
    }),
    fetchKarkunanById: builder.query<{ data: Karkunan }, number>({
      query: (id) => `karkun/${id}`,
      providesTags: ["Karkunan"],
    }),
    addKarkunan: builder.mutation<Karkunan, Partial<Karkunan>>({
      query: (body) => ({
        url: "karkun/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Karkunan"],
    }),
    updateKarkunan: builder.mutation<Karkunan, { id: number; data: Partial<Karkunan> }>({
      query: ({ id, data }) => ({
        url: `karkun/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Karkunan"],
    }),
    deleteKarkunan: builder.mutation<void, number>({
      query: (id) => ({
        url: `karkun/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Karkunan"],
    }),
  }),
});

export const {
  useFetchKarkunansQuery,
  useFetchKarkunanByIdQuery,
  useAddKarkunanMutation,
  useUpdateKarkunanMutation,
  useDeleteKarkunanMutation,
} = karkunanApi;


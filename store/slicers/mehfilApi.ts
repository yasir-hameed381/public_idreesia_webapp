import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface Mehfil {
  id: string;
  title_en: string;
  title_ur: string;
  date: string;
  time?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface MehfilResponse {
  data: Mehfil[];
  meta: {
    total: number;
  };
}

interface MehfilQueryParams {
  page: number;
  size: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const mehfilApi = createApi({
  reducerPath: "mehfilApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Mehfil"],
  endpoints: (builder) => ({
    fetchMehfilsData: builder.query<MehfilResponse, MehfilQueryParams>({
      query: ({ page, size, search = "", startDate, endDate }) => {
        // Build query parameters dynamically
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          category: "all",
        });

        // Add search parameter if provided
        if (search) {
          params.append("search", search);
        }

        // Add date filters if provided
        if (startDate) {
          params.append("startDate", startDate);
        }

        if (endDate) {
          params.append("endDate", endDate);
        }

        return `mehfils-data?${params.toString()}`;
      },
      providesTags: ["Mehfil"],
    }),
    addMehfil: builder.mutation<Mehfil, Partial<Mehfil>>({
      query: (body) => ({
        url: "/mehfils-data/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Mehfil"],
    }),
    updateMehfil: builder.mutation<Mehfil, Partial<Mehfil>>({
      query: ({ id, ...patch }) => ({
        url: `mehfils-data/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Mehfil"],
    }),
    deleteMehfil: builder.mutation<void, string>({
      query: (id) => ({
        url: `mehfils-data/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Mehfil"],
    }),
    // ----Mefil-Zones
    fetchZones: builder.query({
      query: () => "zone",
      // providesTags: ['Zone'],
    }),
    // --MefilAddress
    fetchAddress: builder.query({
      query: () => "mehfil-directory",
      // providesTags: ['mehfil-directory'],
    }),
  }),
});

export const {
  useFetchMehfilsDataQuery,
  useAddMehfilMutation,
  useUpdateMehfilMutation,
  useDeleteMehfilMutation,
  useFetchZonesQuery,
  useFetchAddressQuery,
} = mehfilApi;

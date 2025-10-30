import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface NewEhad {
  id: number;
  name: string;
  father_name: string;
  marfat: string;
  phone_no: string;
  address: string;
  mehfil_directory_id: number;
  zone_id: number;
  created_at: string;
  updated_at: string;
}

interface NewEhadResponse {
  data: NewEhad[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface NewEhadQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  zone_id?: string;
  mehfil_directory_id?: string;
}

export const newEhadApi = createApi({
  reducerPath: "newEhadApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["NewEhad"],
  endpoints: (builder) => ({
    fetchNewEhads: builder.query<NewEhadResponse, NewEhadQueryParams>({
      query: ({ page = 1, per_page = 10, search = "", zone_id, mehfil_directory_id }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: per_page.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        if (zone_id) {
          params.append("zone_id", zone_id);
        }

        if (mehfil_directory_id) {
          params.append("mehfil_directory_id", mehfil_directory_id);
        }

        return `new-karkun?${params.toString()}`;
      },
      providesTags: ["NewEhad"],
    }),
    fetchNewEhadById: builder.query<{ data: NewEhad }, number>({
      query: (id) => `new-karkun/${id}`,
      providesTags: ["NewEhad"],
    }),
    addNewEhad: builder.mutation<NewEhad, Partial<NewEhad>>({
      query: (body) => ({
        url: "new-karkun/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NewEhad"],
    }),
    updateNewEhad: builder.mutation<NewEhad, { id: number; data: Partial<NewEhad> }>({
      query: ({ id, data }) => ({
        url: `new-karkun/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["NewEhad"],
    }),
    deleteNewEhad: builder.mutation<void, number>({
      query: (id) => ({
        url: `new-karkun/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NewEhad"],
    }),
  }),
});

export const {
  useFetchNewEhadsQuery,
  useFetchNewEhadByIdQuery,
  useAddNewEhadMutation,
  useUpdateNewEhadMutation,
  useDeleteNewEhadMutation,
} = newEhadApi;


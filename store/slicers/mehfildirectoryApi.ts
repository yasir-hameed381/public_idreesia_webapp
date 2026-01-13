import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface Mehfil {
  id: string;
  title_en: string;
  title_ur: string;
  date: string;
  is_published:number;
  created_at: string;
  updated_at: string;
}


interface SingleMehfilResponse {
  data: Zone;
}

export const mehfilDirectoryApi = createApi({
  reducerPath: 'mehfilDirectoryApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['mehfilDirtory'],
  endpoints: (builder) => ({
    addMehfilDirectory: builder.mutation<Mehfil, Partial<Mehfil>>({
      query: (body) => ({
        // console.log("form-data",body)
        url: '/mehfil-directory/add',
        method: 'POST',
        body
      }),
      invalidatesTags: ['mehfilDirtory'],
    }),
    UpdateMehfilDirectory: builder.mutation<Mehfil, Partial<Mehfil>>({
      query: ({ id, ...patch }) => ({
        url: `/mehfil-directory/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['mehfilDirtory'],
    }),
    deleteMehfilDirectory: builder.mutation<void, string>({
      query: (id) => ({
        url: `mehfil-directory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mehfilDirtory'],
    }),

fetchAddress: builder.query({
  query: ({ page = 1, size = 8, zoneId = "", search = "" }) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", size.toString());
    if (search) params.set("search", search);
    if (zoneId) params.set("zoneId", zoneId);
    return `mehfil-directory?${params.toString()}`;
  },
  transformResponse: (response: any) => {
    // Handle different response structures
    if (response?.data) {
      return response;
    }
    if (Array.isArray(response)) {
      return { data: response, meta: { total: response.length } };
    }
    return { data: [], meta: { total: 0 } };
  },
  providesTags: ['mehfilDirtory']
}),

     GetMehfilByIdQuery : builder.query<SingleMehfilResponse, string>({
      query: (id) => `mehfil-directory/${id}`,
      providesTags: (result, error, id) => [{ type: 'mehfilDirtory', id }],
    }),

  }),
});

export const {
    useAddMehfilDirectoryMutation,
     useUpdateMehfilDirectoryMutation,
     useFetchAddressQuery,
     useDeleteMehfilDirectoryMutation,
     useGetMehfilByIdQueryQuery
} = mehfilDirectoryApi ;

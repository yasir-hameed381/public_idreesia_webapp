import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Parhaiyan } from "@/app/types/Parhaiyan";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    // debouncedSearch?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const parhaiyanApi = createApi({
  reducerPath: "parhaiyanApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Parhaiyan"],
  endpoints: (builder) => ({
    // GET
    getParhaiyan: builder.query<PaginatedResponse<Parhaiyan>, {
      page: number;
      size: number;
      search?: string;
    }>({
      query: ({ page, size, search = "" }) =>
        `/parhaiyan?page=${page}&size=${size}&search=${search}`,
      providesTags: ["Parhaiyan"],
    }),

    // GET BY ID - Using the list endpoint and filtering client-side
    getParhaiyanById: builder.query<{ data: Parhaiyan | null }, string>({
      query: (id) => `/parhaiyan?page=1&size=1000`,
      transformResponse: (response: PaginatedResponse<Parhaiyan>, meta, arg) => {
        const parhaiyan = response.data.find(item => item.id?.toString() === arg);
        return {
          data: parhaiyan || null,
        };
      },
      providesTags: (result, error, id) => [{ type: "Parhaiyan", id }],
    }),

    // CREATE
    createParhaiyan: builder.mutation<Parhaiyan, Omit<Parhaiyan, "id" | "created_at" | "updated_at">>({
      query: (data) => ({
        url: "/parhaiyan/add",
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Parhaiyan"],
    }),

    // UPDATE
    updateParhaiyan: builder.mutation<Parhaiyan, { id: number; data: Partial<Parhaiyan> }>({
      query: ({ id, data }) => ({
        url: `/parhaiyan/update/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Parhaiyan"],
    }),

    // DELETE
    deleteParhaiyan: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/parhaiyan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Parhaiyan"],
    }),
  }),
});

export const {
  useGetParhaiyanQuery,
  useGetParhaiyanByIdQuery,
  useCreateParhaiyanMutation,
  useUpdateParhaiyanMutation,
  useDeleteParhaiyanMutation,
} = parhaiyanApi;

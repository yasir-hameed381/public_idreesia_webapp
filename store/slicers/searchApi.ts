import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface SearchResult {
  id: number;
  title_en: string;
  title_ur: string;
  track?: string;
  filepath?: string;
}

interface SearchResponse {
  data: SearchResult[];
}

interface SearchParams {
  query: string;
  type: string;
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  endpoints: (builder) => ({
    search: builder.query<SearchResponse, SearchParams>({
      query: ({ query, type }) => ({
        url: `/search`,
        params: {
          query,
          type: type.toLowerCase(),
        },
      }),
    }),
  }),
});

export const { useSearchQuery } = searchApi;
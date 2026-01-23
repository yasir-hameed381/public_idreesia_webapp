import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface MessageData {
  id: number;
  title_en: string;
  title_ur: string;
  description_en?: string;
  description_ur?: string;
  slug: string;
  category_id?: number;
  is_published: string | number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  filename?: string;
  filepath?: string;
  tags?: string;
  track?: string;
  track_date?: string;
  for_karkuns?: boolean;
  for_ehad_karkuns?: boolean;
}

interface MessageResponse {
  data: MessageData[];
  meta: {
    total: number;
  };
  size: number;
}

interface MessageQueryParams {
  page: number;
  size: number;
  search: string;
  category?: string;
}

// Valid category values
export const VALID_MESSAGE_CATEGORIES = ['all', 2, 3];

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    fetchMessagesData: builder.query<MessageResponse, MessageQueryParams>({
      query: ({ page, size, search, category }) => {
        // Validate the category parameter
        const validCategory = category && VALID_MESSAGE_CATEGORIES.includes(category) 
        ? category 
        : 'all';
        
        // Use URLSearchParams for proper encoding
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        // Always include search parameter (even if empty) for consistent cache keys
        params.append('search', search ? search.trim() : '');
        params.append('category', String(validCategory));
        
        return `messages-data?${params.toString()}`;
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
              ...result.data.map(item => ({ type: 'Message' as const, id: item.id })),
              { type: 'Message', id: 'LIST' }
            ]
          : [{ type: 'Message', id: 'LIST' }],
    }),
    getMessageById: builder.query<{ data: MessageData } | MessageData, number>({
      query: (id) => `messages-data/${id}`,
      transformResponse: (response: any) => {
        // Handle different response structures
        if (response?.data) {
          return response;
        }
        return { data: response };
      },
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
    createMessage: builder.mutation<MessageData, Partial<MessageData>>({
      query: (body) => ({
        url: 'messages-data/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),
    updateMessage: builder.mutation<MessageData, Partial<MessageData>>({
      query: ({ id, ...patch }) => ({
        url: `messages-data/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Message', id },
        { type: 'Message', id: 'LIST' },
      ],
    }),
    deleteMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: `messages-data/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetchMessagesDataQuery,
  useGetMessageByIdQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} = messagesApi;

// Alias for backward compatibility with existing code
export const useGetMessagesQuery = useFetchMessagesDataQuery;
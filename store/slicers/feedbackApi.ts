import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

interface FeedbackData {
  id: number;
  name: string;
  contact_no: string;
  type: string;
  subject: string;
  description: string;
  screenshot?: string;
  created_at: string;
  updated_at?: string;
}

interface FeedbackResponse {
  data: FeedbackData[];
  meta: {
    total: number;
  };
  size: number;
}

interface FeedbackQueryParams {
  page: number;
  size: number;
  search: string;
  type?: string;
}

// Valid feedback types
export const VALID_FEEDBACK_TYPES = ['all', 'bug', 'feature', 'improvement', 'other'];

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Feedback'],
  endpoints: (builder) => ({
    fetchFeedbackData: builder.query<FeedbackResponse, FeedbackQueryParams>({
      query: ({ page, size, search, type }) => {
        // Validate the type parameter
        const validType = type && VALID_FEEDBACK_TYPES.includes(type) 
        ? type 
        : 'all';
        return `feedback?page=${page}&size=${size}&search=${search}&type=${validType}`;
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
              ...result.data.map(item => ({ type: 'Feedback' as const, id: item.id })),
              { type: 'Feedback', id: 'LIST' }
            ]
          : [{ type: 'Feedback', id: 'LIST' }],
    }),
    getFeedbackById: builder.query<FeedbackData, number>({
      query: (id) => `feedback/${id}`,
      transformResponse: (response: any) => {
        console.log('Get feedback by ID response:', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Feedback', id }],
    }),
    createFeedback: builder.mutation<FeedbackData, Partial<FeedbackData>>({
      query: (body) => ({
        url: 'feedback/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }],
    }),
    updateFeedback: builder.mutation<FeedbackData, Partial<FeedbackData>>({
      query: ({ id, ...patch }) => ({
        url: `feedback/update/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Feedback', id },
        { type: 'Feedback', id: 'LIST' },
      ],
    }),
    deleteFeedback: builder.mutation<void, number>({
      query: (id) => ({
        url: `feedback/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetchFeedbackDataQuery,
  useGetFeedbackByIdQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;

// Alias for backward compatibility with existing code
export const useGetFeedbackQuery = useFetchFeedbackDataQuery;

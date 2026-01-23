import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface MessageSchedule {
  id: number;
  message_id: number;
  scheduled_at: string;
  repeat: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'no-repeat';
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  last_sent_at?: string | null;
  next_run_at?: string | null;
  is_active: boolean;
  send_to_mobile_devices: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface MessageScheduleResponse {
  success?: boolean;
  message?: string;
  data: MessageSchedule;
}

export interface MessageScheduleListResponse {
  data: MessageSchedule[];
  meta: {
    total: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  };
  links?: any;
}

export interface CreateMessageSchedulePayload {
  message_id: number;
  scheduled_date: string;
  scheduled_time: string;
  repeat: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'no-repeat';
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  is_active?: boolean;
  send_to_mobile_devices?: boolean;
  created_by?: number;
  updated_by?: number;
}

export interface UpdateMessageSchedulePayload extends Partial<CreateMessageSchedulePayload> {
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface MessageScheduleQueryParams {
  page?: number;
  size?: number;
  message_id?: number;
}

export const messageSchedulesApi = createApi({
  reducerPath: 'messageSchedulesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['MessageSchedule'],
  endpoints: (builder) => ({
    createMessageSchedule: builder.mutation<MessageScheduleResponse, CreateMessageSchedulePayload>({
      query: (body) => ({
        url: 'message-schedules',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MessageSchedule', id: 'LIST' }],
    }),
    getMessageSchedules: builder.query<MessageScheduleListResponse, MessageScheduleQueryParams>({
      query: ({ page = 1, size = 25, message_id }) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        if (message_id) {
          params.append('message_id', String(message_id));
        }
        return `message-schedules?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({ type: 'MessageSchedule' as const, id: item.id })),
              { type: 'MessageSchedule', id: 'LIST' },
            ]
          : [{ type: 'MessageSchedule', id: 'LIST' }],
    }),
    getMessageScheduleById: builder.query<MessageScheduleResponse, number>({
      query: (id) => `message-schedules/${id}`,
      providesTags: (result, error, id) => [{ type: 'MessageSchedule', id }],
    }),
    updateMessageSchedule: builder.mutation<MessageScheduleResponse, { id: number; data: UpdateMessageSchedulePayload }>({
      query: ({ id, data }) => ({
        url: `message-schedules/update/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MessageSchedule', id },
        { type: 'MessageSchedule', id: 'LIST' },
      ],
    }),
    deleteMessageSchedule: builder.mutation<void, number>({
      query: (id) => ({
        url: `message-schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MessageSchedule', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateMessageScheduleMutation,
  useGetMessageSchedulesQuery,
  useGetMessageScheduleByIdQuery,
  useUpdateMessageScheduleMutation,
  useDeleteMessageScheduleMutation,
} = messageSchedulesApi;

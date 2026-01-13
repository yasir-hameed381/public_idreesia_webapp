import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';
import type { MehfilReport, MehfilReportsResponse, MehfilReportsQueryParams, MehfilReportFormData } from '../../types/mehfilReports';

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

// API Configuration
const API_ENDPOINTS = {
  MEHFIL_REPORTS: {
    LIST: 'mehfil-reports',
    CREATE: 'mehfil-reports',
    GET: (id: string) => `mehfil-reports/${id}`,
    UPDATE: (id: string) => `mehfil-reports/${id}`,
    DELETE: (id: string) => `mehfil-reports/${id}`,
    FILTERS: 'mehfil-reports/filters',
  }
};

export const mehfilReportsApi = createApi({
  reducerPath: 'mehfilReportsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['MehfilReports'],
  endpoints: (builder) => ({
    fetchMehfilReports: builder.query<MehfilReportsResponse, MehfilReportsQueryParams>({
      query: ({ page, size, search = '', zone = '', month = '', year = '', mehfil = '' }) => {
        const params = buildQueryParams({
          page,
          size,
          search,
          zone,
          month,
          year,
          mehfil_directory_id: mehfil,
        });
        return `${API_ENDPOINTS.MEHFIL_REPORTS.LIST}?${params}`;
      },
      providesTags: ['MehfilReports'],
      transformResponse: (response: any) => {
        // Handle different response structures from your backend
        if (response.data && response.meta) {
          return response; // Already in correct format
        }
        if (response.data) {
          return {
            data: response.data,
            meta: {
              total: response.total || response.data.length,
              current_page: response.current_page || 1,
              last_page: response.last_page || 1,
              per_page: response.per_page || response.data.length,
            }
          };
        }
        return response;
      },
    }),
    fetchMehfilReport: builder.query<MehfilReport, string>({
      query: (id) => API_ENDPOINTS.MEHFIL_REPORTS.GET(id),
      providesTags: (result, error, id) => [{ type: 'MehfilReports', id }],
      transformResponse: (response: any) => {
        // Handle different response structures from your backend
        if (response.data) {
          return response.data;
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        // Handle error responses from your backend
        return {
          status: response.status,
          data: response.data || response,
          error: response.error || 'Failed to fetch report'
        };
      },
    }),
    addMehfilReport: builder.mutation<MehfilReport, MehfilReportFormData>({
      query: (body) => ({
        url: API_ENDPOINTS.MEHFIL_REPORTS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MehfilReports'],
      transformResponse: (response: any) => {
        return response.data || response;
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          data: response.data || response,
          error: response.error || 'Failed to create report'
        };
      },
    }),
    updateMehfilReport: builder.mutation<MehfilReport, MehfilReportFormData & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: API_ENDPOINTS.MEHFIL_REPORTS.UPDATE(id),
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MehfilReports', id },
        'MehfilReports',
      ],
      transformResponse: (response: any) => {
        return response.data || response;
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          data: response.data || response,
          error: response.error || 'Failed to update report'
        };
      },
    }),
    deleteMehfilReport: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.MEHFIL_REPORTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'MehfilReports', id },
        'MehfilReports',
      ],
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          data: response.data || response,
          error: response.error || 'Failed to delete report'
        };
      },
    }),
    fetchReportFilters: builder.query({
      query: () => API_ENDPOINTS.MEHFIL_REPORTS.FILTERS,
      providesTags: ['MehfilReports'],
    }),
  }),
});

export const {
  useFetchMehfilReportsQuery,
  useFetchMehfilReportQuery,
  useAddMehfilReportMutation,
  useUpdateMehfilReportMutation,
  useDeleteMehfilReportMutation,
  useFetchReportFiltersQuery,
} = mehfilReportsApi; 
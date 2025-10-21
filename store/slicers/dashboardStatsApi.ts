import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';

export interface DashboardStats {
  zones: number;
  mehfilDirectory: number;
  ehadKarkuns: number;
  totalMehfils: number;
  totalNaats: number;
  totalTaleemat: number;
  totalWazaifs: number;
  messagesSent: number;
  karkunJoinRequests?: number;
  namazTimings?: number;
  parhaiyan?: number;
}

export interface DashboardStatsResponse {
  data: DashboardStats;
  success: boolean;
  message?: string;
}

export const dashboardStatsApi = createApi({
  reducerPath: 'dashboardStatsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getApiBaseUrl(),
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['DashboardStats'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, { timePeriod?: string }>({
      query: ({ timePeriod = 'Last 7 Days' }) => {
        // Convert time period to API parameters
        let startDate = '';
        let endDate = '';
        
        const now = new Date();
        switch (timePeriod) {
          case 'Last 7 Days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'Last 30 Days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'Last 90 Days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'Last Year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        endDate = now.toISOString();
        
        return `dashboard/stats?startDate=${startDate}&endDate=${endDate}`;
      },
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardStatsApi;





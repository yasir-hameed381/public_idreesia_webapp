import { QueryClient } from '@tanstack/react-query';

// Optimized Query Client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - unused data stays in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch on internet reconnection
      refetchOnMount: false, // Don't refetch on component mount if data exists
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Pre-configure specific query keys with custom options
export const queryKeys = {
  // Static/rarely changing data - longer cache
  categories: {
    all: ['categories'],
    list: (filters?: any) => ['categories', 'list', filters],
    detail: (id: string) => ['categories', 'detail', id],
  },
  tags: {
    all: ['tags'],
    list: (filters?: any) => ['tags', 'list', filters],
  },
  zones: {
    all: ['zones'],
    list: (filters?: any) => ['zones', 'list', filters],
    detail: (id: string) => ['zones', 'detail', id],
  },
  // Frequently changing data - shorter cache
  mehfils: {
    all: ['mehfils'],
    list: (filters?: any) => ['mehfils', 'list', filters],
    detail: (id: string) => ['mehfils', 'detail', id],
  },
  messages: {
    all: ['messages'],
    list: (filters?: any) => ['messages', 'list', filters],
    detail: (id: string) => ['messages', 'detail', id],
  },
  karkuns: {
    all: ['karkuns'],
    list: (filters?: any) => ['karkuns', 'list', filters],
    detail: (id: string) => ['karkuns', 'detail', id],
  },
  reports: {
    all: ['reports'],
    list: (filters?: any) => ['reports', 'list', filters],
    detail: (id: string) => ['reports', 'detail', id],
  },
} as const;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders, getApiBaseUrl } from '@/lib/apiConfig';
import type { Committee, CommitteeMember, ParentCommitteeOption } from '@/types/committee';

interface CommitteesResponse {
  data: Committee[];
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    per_page?: string;
    to?: number;
    total: number;
  };
  links?: Record<string, string | null>;
}

interface CommitteeMembersResponse {
  success: boolean;
  data: CommitteeMember[];
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    per_page?: string;
    to?: number;
    total: number;
  };
  links?: Record<string, string | null>;
}

interface CommitteePortalContextResponse {
  success: boolean;
  has_access: boolean;
  committees: {
    membership_id: number;
    committee_id: number;
    role: string;
    duty: string | null;
    committee: {
      id: number;
      name: string;
      description: string | null;
      parent_id: number | null;
      parent_name: string | null;
    };
  }[];
  selected_committee: {
    membership_id: number;
    committee_id: number;
    role: string;
    duty: string | null;
    committee: {
      id: number;
      name: string;
      description: string | null;
      parent_id: number | null;
      parent_name: string | null;
    };
  } | null;
}

interface CommitteePortalDashboardResponse {
  success: boolean;
  has_access: boolean;
  committee?: {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    parent_name: string | null;
  };
  role?: string;
  duty?: string | null;
  stats?: {
    members: number;
    messages: number;
    documents: number;
    meetings: number;
    active_polls: number;
  };
  recent_meetings?: unknown[];
  active_polls?: unknown[];
}

export const committeesApi = createApi({
  reducerPath: 'committeesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/`,
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ['Committees', 'Committee'],
  endpoints: (builder) => ({
    fetchCommittees: builder.query<CommitteesResponse, { page?: number; size?: number; search?: string }>({
      query: ({ page = 1, size = 10, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('size', String(size));
        if (search) params.set('search', search);
        return `committees?${params.toString()}`;
      },
      transformResponse: (response: CommitteesResponse) => {
        if (response?.data) return response;
        if (Array.isArray(response)) {
          return { data: response as Committee[], meta: { total: (response as Committee[]).length } };
        }
        return { data: [], meta: { total: 0 } };
      },
      providesTags: ['Committees'],
    }),
    getCommitteeById: builder.query<{ success: boolean; data: Committee }, string | number>({
      query: (id) => `committees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Committee', id: String(id) }],
    }),
    getParentCommittees: builder.query<{ data: ParentCommitteeOption[] }, void>({
      query: () => 'committees/parents',
      providesTags: ['Committees'],
    }),
    addCommittee: builder.mutation<{ success: boolean; data: Committee }, Partial<Committee>>({
      query: (body) => ({
        url: 'committees/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Committees'],
    }),
    updateCommittee: builder.mutation<{ success: boolean }, { id: number | string; body: Partial<Committee> }>({
      query: ({ id, body }) => ({
        url: `committees/update/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Committees', 'Committee'],
    }),
    deleteCommittee: builder.mutation<{ success: boolean; message?: string }, string | number>({
      query: (id) => ({
        url: `committees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Committees'],
    }),
    fetchCommitteeMembers: builder.query<
      CommitteeMembersResponse,
      { committeeId: string | number; page?: number; size?: number; search?: string }
    >({
      query: ({ committeeId, page = 1, size = 10, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('size', String(size));
        if (search) params.set('search', search);
        return `committees/${committeeId}/members?${params.toString()}`;
      },
      providesTags: ['Committee'],
    }),
    addCommitteeMember: builder.mutation<
      { success: boolean; message?: string },
      { committeeId: string | number; user_id: number; role: 'admin' | 'member'; duty?: string | null }
    >({
      query: ({ committeeId, ...body }) => ({
        url: `committees/${committeeId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Committee', 'Committees'],
    }),
    updateCommitteeMember: builder.mutation<
      { success: boolean; message?: string },
      { committeeId: string | number; memberId: string | number; role?: 'admin' | 'member'; duty?: string | null }
    >({
      query: ({ committeeId, memberId, ...body }) => ({
        url: `committees/${committeeId}/members/${memberId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Committee', 'Committees'],
    }),
    deleteCommitteeMember: builder.mutation<
      { success: boolean; message?: string },
      { committeeId: string | number; memberId: string | number }
    >({
      query: ({ committeeId, memberId }) => ({
        url: `committees/${committeeId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Committee', 'Committees'],
    }),
    fetchCommitteeUserOptions: builder.query<
      { success: boolean; data: { id: number; name: string; email: string }[] },
      { search?: string; size?: number } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.search) params.set('search', args.search);
        if (args?.size) params.set('size', String(args.size));
        return `committees/users/options${params.toString() ? `?${params.toString()}` : ''}`;
      },
      providesTags: ['Committee'],
    }),
    fetchCommitteePortalContext: builder.query<CommitteePortalContextResponse, void>({
      query: () => 'committees/portal/context',
      providesTags: ['Committee'],
    }),
    fetchCommitteePortalDashboard: builder.query<CommitteePortalDashboardResponse, { committee_id?: number } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.committee_id) params.set('committee_id', String(args.committee_id));
        return `committees/portal/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      },
      providesTags: ['Committee'],
    }),
  }),
});

export const {
  useFetchCommitteesQuery,
  useGetCommitteeByIdQuery,
  useGetParentCommitteesQuery,
  useAddCommitteeMutation,
  useUpdateCommitteeMutation,
  useDeleteCommitteeMutation,
  useFetchCommitteeMembersQuery,
  useAddCommitteeMemberMutation,
  useUpdateCommitteeMemberMutation,
  useDeleteCommitteeMemberMutation,
  useFetchCommitteeUserOptionsQuery,
  useFetchCommitteePortalContextQuery,
  useFetchCommitteePortalDashboardQuery,
} = committeesApi;

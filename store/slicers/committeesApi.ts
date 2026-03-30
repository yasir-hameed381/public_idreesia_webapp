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
  recent_meetings?: {
    id: number;
    title: string;
    meeting_date: string | null;
  }[];
  active_polls?: {
    id: number;
    hash_id: string;
    question: string;
    created_at: string | null;
  }[];
}

interface CommitteePortalPollListItem {
  id: number;
  hash_id: string;
  question: string;
  description: string | null;
  is_active: boolean;
  allow_multiple: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: number | null;
  total_votes: number;
  options_count: number;
  has_user_voted: boolean;
}

interface CommitteePortalPollsResponse {
  success: boolean;
  has_access: boolean;
  is_admin: boolean;
  data: CommitteePortalPollListItem[];
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

interface CommitteePortalPollOption {
  id: number;
  option: string;
  vote_count: number;
  percentage: number;
}

interface CommitteePortalPollDetailResponse {
  success: boolean;
  has_access: boolean;
  is_admin?: boolean;
  poll?: {
    id: number;
    hash_id: string;
    committee_id: number;
    question: string;
    description: string | null;
    is_active: boolean;
    allow_multiple: boolean;
    expires_at: string | null;
    created_at: string;
    created_by: number | null;
    created_by_name?: string;
    options: CommitteePortalPollOption[];
    total_votes: number;
    has_voted: boolean;
    user_selected_option_ids: number[];
    can_vote: boolean;
    is_expired: boolean;
  };
  message?: string;
}

interface CommitteePortalMeetingsResponse {
  success: boolean;
  has_access: boolean;
  data: {
    id: number;
    hash_id?: string | null;
    title: string;
    description: string;
    meeting_date: string | null;
    attendance: number;
  }[];
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

interface CommitteePortalMeetingResponse {
  success: boolean;
  has_access: boolean;
  data?: {
    id: number;
    hash_id?: string | null;
    title: string;
    description: string;
    meeting_date: string | null;
    attendance: number;
  };
  message?: string;
}

interface CommitteePortalMeetingAttendanceResponse {
  success: boolean;
  has_access: boolean;
  meeting?: {
    id: number;
    hash_id?: string | null;
    title: string;
    meeting_date: string | null;
  };
  summary?: {
    total_members: number;
    present: number;
    absent: number;
    excused: number;
  };
  data?: {
    user_id: number;
    name: string;
    email: string;
    status: 'present' | 'absent' | 'excused';
    note: string;
  }[];
  message?: string;
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
    fetchCommitteePortalPolls: builder.query<
      CommitteePortalPollsResponse,
      { filter?: 'active' | 'closed' | 'all'; search?: string; page?: number; size?: number } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.filter) params.set('filter', args.filter);
        if (args?.search) params.set('search', args.search);
        if (args?.page) params.set('page', String(args.page));
        if (args?.size) params.set('size', String(args.size));
        return `committees/portal/polls${params.toString() ? `?${params.toString()}` : ''}`;
      },
      providesTags: ['Committee'],
    }),
    fetchCommitteePortalPollById: builder.query<CommitteePortalPollDetailResponse, string>({
      query: (id) => `committees/portal/polls/${id}`,
      providesTags: ['Committee'],
    }),
    fetchCommitteePortalMeetings: builder.query<
      CommitteePortalMeetingsResponse,
      { page?: number; size?: number; search?: string } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.set('page', String(args.page));
        if (args?.size) params.set('size', String(args.size));
        if (args?.search) params.set('search', args.search);
        return `committees/portal/meetings${params.toString() ? `?${params.toString()}` : ''}`;
      },
      providesTags: ['Committee'],
    }),
    fetchCommitteePortalMeetingById: builder.query<CommitteePortalMeetingResponse, number | string>({
      query: (id) => `committees/portal/meetings/${id}`,
      providesTags: ['Committee'],
    }),
    createCommitteePortalMeeting: builder.mutation<
      { success: boolean; message?: string },
      { title: string; description?: string | null; meeting_date?: string | null }
    >({
      query: (body) => ({
        url: 'committees/portal/meetings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Committee'],
    }),
    updateCommitteePortalMeeting: builder.mutation<
      { success: boolean; message?: string },
      { id: number | string; body: { title: string; description?: string | null; meeting_date?: string | null } }
    >({
      query: ({ id, body }) => ({
        url: `committees/portal/meetings/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Committee'],
    }),
    deleteCommitteePortalMeeting: builder.mutation<{ success: boolean; message?: string }, number | string>({
      query: (id) => ({
        url: `committees/portal/meetings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Committee'],
    }),
    fetchCommitteePortalMeetingAttendance: builder.query<CommitteePortalMeetingAttendanceResponse, number | string>({
      query: (id) => `committees/portal/meetings/${id}/attendance`,
      providesTags: ['Committee'],
    }),
    saveCommitteePortalMeetingAttendance: builder.mutation<
      { success: boolean; message?: string },
      { id: number | string; attendance: { user_id: number; status: 'present' | 'absent' | 'excused'; note?: string }[] }
    >({
      query: ({ id, attendance }) => ({
        url: `committees/portal/meetings/${id}/attendance`,
        method: 'POST',
        body: { attendance },
      }),
      invalidatesTags: ['Committee'],
    }),
    createCommitteePortalPoll: builder.mutation<
      { success: boolean; message?: string },
      {
        question: string;
        description?: string | null;
        is_active: boolean;
        allow_multiple: boolean;
        expires_at?: string | null;
        options: string[];
      }
    >({
      query: (body) => ({ url: 'committees/portal/polls', method: 'POST', body }),
      invalidatesTags: ['Committee'],
    }),
    updateCommitteePortalPoll: builder.mutation<
      { success: boolean; message?: string },
      {
        id: string;
        body: {
          question: string;
          description?: string | null;
          is_active: boolean;
          allow_multiple: boolean;
          expires_at?: string | null;
          options: string[];
        };
      }
    >({
      query: ({ id, body }) => ({ url: `committees/portal/polls/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Committee'],
    }),
    deleteCommitteePortalPoll: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({ url: `committees/portal/polls/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Committee'],
    }),
    voteCommitteePortalPoll: builder.mutation<{ success: boolean; message?: string }, { id: string; option_ids: number[] }>({
      query: ({ id, option_ids }) => ({
        url: `committees/portal/polls/${id}/vote`,
        method: 'POST',
        body: { option_ids },
      }),
      invalidatesTags: ['Committee'],
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
  useFetchCommitteePortalPollsQuery,
  useFetchCommitteePortalPollByIdQuery,
  useFetchCommitteePortalMeetingsQuery,
  useFetchCommitteePortalMeetingByIdQuery,
  useCreateCommitteePortalMeetingMutation,
  useUpdateCommitteePortalMeetingMutation,
  useDeleteCommitteePortalMeetingMutation,
  useFetchCommitteePortalMeetingAttendanceQuery,
  useSaveCommitteePortalMeetingAttendanceMutation,
  useCreateCommitteePortalPollMutation,
  useUpdateCommitteePortalPollMutation,
  useDeleteCommitteePortalPollMutation,
  useVoteCommitteePortalPollMutation,
} = committeesApi;

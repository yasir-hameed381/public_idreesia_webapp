export interface Committee {
  id: number;
  parent_id: number | null;
  parent_name?: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  members_count?: number;
  is_sub_committee?: boolean;
}

export interface ParentCommitteeOption {
  id: number;
  name: string;
}

export interface CommitteeFormValues {
  name: string;
  description?: string | null;
  is_active: boolean;
  parent_id?: string | number | null;
}

export interface CommitteeMember {
  id: number;
  committee_id: number;
  user_id: number;
  role: "admin" | "member";
  duty?: string | null;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

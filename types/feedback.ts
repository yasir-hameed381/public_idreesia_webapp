export interface Feedback {
  id: number;
  name: string;
  contact_no: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  subject: string;
  description: string;
  screenshot?: string;
  created_at: string;
  updated_at?: string;
}

export interface FeedbackFormData {
  name: string;
  contact_no: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  subject: string;
  description: string;
  screenshot?: string;
}

export interface FeedbackQueryParams {
  page: number;
  size: number;
  search: string;
  type?: string;
}

export interface FeedbackResponse {
  data: Feedback[];
  meta: {
    total: number;
  };
  size: number;
}

export const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'other', label: 'Other' },
] as const;

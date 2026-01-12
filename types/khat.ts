export type KhatStatus = "pending" | "in-review" | "awaiting-response" | "closed";

export type KhatType = "khat" | "masail";

export interface JawabLink {
  title: string;
  url: string;
}

export interface ZoneSummary {
  id: number;
  title_en: string;
  city_en?: string;
  title_ur?: string;
  city_ur?: string;
}

export interface MehfilSummary {
  id: number;
  zone_id?: number;
  mehfil_number: string;
  name_en: string;
  name_ur?: string;
  address_en?: string;
}

export interface Khat {
  id?: number;
  zone_id?: number | null;
  mehfil_directory_id?: number | null;
  email?: string | null;
  phone_number: string;
  full_name: string;
  father_name: string;
  introducer_name?: string | null;
  age: number;
  ehad_duration: string;
  address?: string | null;
  city?: string | null;
  last_tarteeb?: string | null;
  consistent_in_wazaif?: boolean;
  consistent_in_prayers?: boolean;
  consistent_in_ishraq?: boolean;
  makes_up_missed_prayers?: boolean;
  missed_prayers?: string[] | null;
  can_read_quran?: boolean;
  multan_visit_frequency?: string;
  mehfil_attendance_frequency?: string;
  is_submitted_before?: boolean;
  last_submission_wazaifs?: string | null;
  kalimah_quantity?: number;
  allah_quantity?: number;
  laa_ilaaha_illallah_quantity?: number;
  sallallahu_alayhi_wasallam_quantity?: number;
  astagfirullah_quantity?: number;
  ayat_ul_kursi_quantity?: number;
  dua_e_talluq_quantity?: number;
  dua_e_waswasey_quantity?: number;
  additional_wazaif_reading?: string | null;
  description?: string | null;
  reciter_relation?: string | null;
  reciter_name?: string | null;
  reciter_age?: number | null;
  reciter_ehad_duration?: string | null;
  reciter_consistent_in_wazaif?: boolean | null;
  reciter_consistent_in_prayers?: boolean | null;
  reciter_makes_up_missed_prayers?: boolean | null;
  reciter_missed_prayers?: string[] | null;
  reciter_can_read_quran?: boolean | null;
  reciter_multan_visit_frequency?: string | null;
  reciter_mehfil_attendance_frequency?: string | null;
  type?: KhatType;
  status?: KhatStatus;
  jawab?: string | null;
  jawab_links?: JawabLink[] | null;
  notes?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
  zone?: ZoneSummary | null;
  mehfilDirectory?: MehfilSummary | null;
  questions?: KhatQuestion[] | null;
}

export interface PaginatedKhatResponse {
  success?: boolean;
  data: Khat[];
  links?: Record<string, string | null>;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number | string;
    total?: number;
  };
}

export interface KhatQuestion {
  id: number;
  khat_id: number;
  question: string;
  answer?: string | null;
  answered_at?: string | null;
  asked_by?: number | null;
  created_at?: string;
  updated_at?: string;
  askedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ResponseTemplate {
  id: number;
  title: string;
  jawab?: string | null;
  jawab_links?: JawabLink[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface SearchResource {
  id: number;
  title_en: string;
  title_ur?: string;
  slug?: string;
  url: string;
  is_admin_favorite?: boolean;
  track?: string;
  date?: string;
}



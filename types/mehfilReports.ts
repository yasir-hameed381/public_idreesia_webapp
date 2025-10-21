export interface MehfilReport {
  id: string;
  report_period: string;
  zone: {
    id: string;
    title_en: string;
    title_ur: string;
  };
  mehfil: {
    id: string;
    address_en: string;
    address_ur: string;
    mehfil_number: string;
  };
  coordinator: {
    name: string;
    attendance_days: number;
  };
  karkun_stats: {
    total_duty_karkuns: number;
    low_attendance: number;
    new_ehads: number;
  };
  ehad_karkun: {
    name: string;
  };
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface MehfilReportFormData {
  id?: string;
  report_period: string;
  zone_id: string;
  mehfil_id: string;
  coordinator_name: string;
  coordinator_attendance_days: number;
  total_duty_karkuns: number;
  low_attendance: number;
  new_ehads: number;
  ehad_karkun_name: string;
  submitted_at: string;
}

export interface MehfilReportsResponse {
  data: MehfilReport[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export interface MehfilReportsQueryParams {
  page: number;
  size: number;
  search?: string;
  zone?: string;
  month?: string;
  year?: string;
} 
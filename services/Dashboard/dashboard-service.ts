import { apiConfig } from "@/lib/apiConfig";


export interface DashboardStats {
  // Basic Stats
  totalKarkuns: number;
  ehadKarkuns: number;
  totalNewEhads: number;
  totalTabarukats: number;

  // Zone Admin Stats
  totalMehfils: number;
  mehfilsWithReports: number;
  mehfilsWithoutReports: number;
  reportSubmissionRate: number;
  mehfilsWithReportsList: MehfilWithReport[];
  mehfilsWithoutReportsList: MehfilWithoutReport[];

  // Mehfil Admin Stats
  hasSubmittedReport: boolean;
  monthlyAttendanceDays: number;
  totalDutyKarkuns: number;

  // Region Admin Stats
  totalZones: number;
  zonesWithReports: number;
  zoneReportStats: ZoneReportStat[];
}

export interface MehfilWithReport {
  id: number;
  mehfil_number: string;
  name: string;
  address: string;
  submitted_at: string | null;
  coordinator_name: string | null;
  total_duty_karkuns: number;
  mehfil_days_in_month: number;
}

export interface MehfilWithoutReport {
  id: number;
  mehfil_number: string;
  name: string;
  address: string;
  zimdar_bhai_name: string | null;
  zimdar_bhai_phone: string | null;
  last_report: string;
}

export interface ZoneReportStat {
  zone_id: number;
  zone_name: string;
  total_mehfils: number;
  karkun: number;
  ehad_karkun: number;
  tabarukats: number;
  new_ehad: number;
  reports_submitted: number;
  submission_rate: number;
}

export interface DashboardFilters {
  selectedMonth: number;
  selectedYear: number;
  selectedZoneId?: number | null;
  selectedMehfilId?: number | null;
}

export interface OverallTotals {
  totalKarkunans: number;
  totalEhadKarkuns: number;
  totalMehfils: number;
  totalZones: number;
  totalMehfilReports: number;
  totalDutyTypes: number;
  totalCoordinators: number;
}

export class DashboardService {
  static async getDashboardStats(
    filters: DashboardFilters
  ): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();
      params.append("selected_month", filters.selectedMonth.toString());
      params.append("selected_year", filters.selectedYear.toString());
      
      if (filters.selectedZoneId) {
        params.append("selected_zone_id", filters.selectedZoneId.toString());
      }
      
      if (filters.selectedMehfilId) {
        params.append("selected_mehfil_id", filters.selectedMehfilId.toString());
      }

      const response = await fetch(
        `${apiConfig.baseURL}/api/dashboard/stats?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  static async getOverallTotals(): Promise<OverallTotals> {
    try {
      const response = await fetch(
        `${apiConfig.baseURL}/api/dashboard/overall-totals`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching overall totals:", error);
      throw error;
    }
  }
}


export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  idCardNumber?: string;
  fatherName?: string;
  userType: string;
  zone?: string;
  mehfil?: string;
  ehadYear?: string;
  birthYear?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
  isSuperAdmin: boolean;
  isZoneAdmin: boolean;
  isMehfilAdmin: boolean;
  dutyType?: string;
  dutyDays?: string[];
  createdAt: string;
  avatar?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email?: string;
  mobile_no?: string;
  cnic_no?: string;
  father_name?: string;
  user_type?: string;
  zone?: string;
  mehfile?: string;
  ehad_year?: number;
  birth_year?: number;
  address?: string;
  city?: string;
  country?: string;
  duty_type?: string;
  duty_days?: string[];
  is_zone_admin?: boolean;
  is_mehfile_admin?: boolean;
  password?: string;
}

export interface AdminUserQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface Zone {
  id: number;
  title_en: string;
}

export interface Mehfil {
  id: number;
  address_en: string;
  zone_id?: number;
}

export interface CreateAdminUserData {
  name: string;
  email?: string;
  mobile_no?: string;
  cnic_no?: string;
  father_name?: string;
  user_type?: string;
  zone?: string;
  mehfile?: string;
  ehad_year?: number;
  birth_year?: number;
  address?: string;
  city?: string;
  country?: string;
  duty_type?: string;
  duty_days?: string[];
  is_zone_admin?: boolean;
  is_mehfile_admin?: boolean;
  password?: string;
}


export interface KarkunFormData {
  zone_id: string; 
  name_en: string;
  name_ur: string;
  so_en?: string;
  so_ur?: string;
  mobile_no: string;
  cnic?: string;
  city_en: string;
  city_ur: string;
  country_en: string;
  country_ur: string;
  birth_year?: Date | null;
  ehad_year?: Date | null;
  ehad_ijazat_year?: Date | null;
  description?: string;
}

export interface KarkunTableProps {
  onEdit: (data: any) => void;
  onAdd: () => void;
}
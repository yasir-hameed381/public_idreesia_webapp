

export interface ZoneFormData {
  title_en: string;
  title_ur: string;
  description?: string;
  country_en ?: string;
  country_ur ?: string;
  city_en: string;
  city_ur: string;
  ceo?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
}

 

export interface ZoneTableProps {
  onEdit: (zone: any) => void;
  onAdd: () => void;
  oncancel: ()=>void;
}


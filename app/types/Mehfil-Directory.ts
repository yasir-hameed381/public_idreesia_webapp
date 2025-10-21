export  interface Zone {
  id: string;
  title_en: string;
}

export interface MehfilFormData {
  is_published: number;
  zone_id: number;
  mehfil_number: string;
  name_en: string;
  name_ur: string;
  address_en: string;
  address_ur: string;
  city_en: string;
  city_ur: string;
  country_en: string;
  country_ur: string;
  google_location?: string | null;
  mediacell_co?: string | null;
  co_phone_number?: string | null;
  zimdar_bhai?: string | null;
  zimdar_bhai_phone_number?: string | null;
  zimdar_bhai_phone_number_2?: string | null;
  zimdar_bhai_phone_number_3?: string | null;
  sarkari_rent?: string | null;
  mehfil_open?: string | null;
  ipad_serial_number?: string | null;
  description?: string | null;
}


export  interface AddressTableProps {
  onEdit: (address: any) => void;
  onAdd: () => void;
}
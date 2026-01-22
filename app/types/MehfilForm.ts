export interface Mehfil {
  id?: string;
  date?: string;
  is_published?: string;
  time?: string;
  old?: string;
  type?: string;
  title_en?: string;
  title_ur?: string;
  description?: string;
  description_en?: string;
  filename?: string;
  filepath?: string;
  updated_by?: number;
  created_by?: number;
}

export interface MehfilTables {
  id: string
  slug: string
  title_en?: string
  title_ur?: string
  description?: string
  description_en?: string
  date?: any
  time?: string
  old?: string
  type?: string
  is_published?: boolean
  is_for_karkun?: boolean
  is_for_ehad_karkun?: boolean
  is_sticky?: boolean
  filename: string
  filepath?: string
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface MehfilFormProps {
  type: string;
  initialMehfilData?: MehfilTables;
  onSubmitSuccess?: () => void;
  onCancel: () => void;
  onAddNewData: (data: MehfilTables) => void;
  onUpdateData?: (data: MehfilTables) => void;
}




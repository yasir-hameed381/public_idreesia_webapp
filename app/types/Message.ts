export interface Message {
  id: number;
  title_en: string;
  title_ur: string;
  description_en?: string;
  description_ur?: string;
  slug: string;
  category_id?: number;
  is_published: string | number;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  filename?: string;
  filepath?: string;
  tags?: string;
  track?: string;
  track_date?: string;
  for_karkuns?: boolean;
  for_ehad_karkuns?: boolean;
}

export interface MessageFormData {
  title_en: string;
  title_ur: string;
  description_en?: string;
  description_ur?: string;
  category_id: string;
  track?: string;
  track_date?: string;
  tags?: string;
  is_published: boolean;
  for_karkuns?: boolean;
  for_ehad_karkuns?: boolean;
  audioFile?: File;
}

export interface MessageFormProps {
  type: string;
  customFieldLabels?: Record<string, string>;
  onCancel: () => void;
  onSubmit?: (data: Partial<Message>) => Promise<void>;
  onAddNewData: (data: Partial<Message>) => Promise<any>;
  onUpdateData: (data: Partial<Message>) => Promise<any>;
  editingItem?: Message | null;
}
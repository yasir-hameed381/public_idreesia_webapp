// export interface NaatShareef {
//   id: number;
//   slug?: string;
//   title_en: string;
//   title_ur: string;
//   description_en?: string;
//   description_ur?: string;
//   category_id: string;
//   is_published: string;
//   track: string;
//   tags?: string;
//   filename?: string;
//   filepath?: string;
//   created_at?: string;
//   updated_at?: string;
//   created_by?: string;
//   updated_by?: string;
// }

// export type naatTaleematFormData = {
//   slug?: string;
//   title_en: string;
//   title_ur: string;
//   description_en?: string;
//   description_ur?: string;
//   category_id: string;
//   is_published: boolean | string;
//   track: string;
//   tags?: string;
//   filename?: string;
//   filepath?: string;
//   audioFile: File | null;
// };

// export interface Naat_TaleematFormProps {
//   type: "Add Naat Shareef" | "Edit Naat Shareef";
//   disabledFields?: {["description_en"], ["description_ur"]};
//   customFieldLabels?: Record<string, string>;
//   onCancel: () => void;
//   editingItem?: NaatShareef | null;
//   onSubmit?: (formData: Partial<NaatShareef>) => Promise<void>;
//   onAddNewData: (formData: Partial<NaatShareef>) => Promise<any>;
//   onUpdateData?: (formData: Partial<NaatShareef>) => Promise<any>;
// }

// types/Naat-Taleemat.ts

export interface NaatShareef {
  id: number;
  slug: string;
  title_en: string;
  title_ur: string;
  status: number; // 1 for published, 0 for unpublished
  is_published: string; // "1" or "0" (legacy field)
  category_id: string;
  track: string;
  tags?: string;
  description_en?: string;
  description_ur?: string;
  filename?: string;
  filepath?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface NaatShareefFormData {
  is_published: boolean;
  category_id: string;
  track: string;
  tags?: string;
  title_en: string;
  title_ur: string;
  description_en: string;
  description_ur: string;
  audioFile: File | null;
}

export interface NaatShareefFormProps {
  type: string;
  customFieldLabels?: Record<string, string>;
  onCancel: () => void;
  onSubmit?: (data: Partial<NaatShareef>) => Promise<void>;
  onAddNewData: (data: Partial<NaatShareef>) => Promise<any>;
  onUpdateData?: (data: Partial<NaatShareef>) => Promise<any>;
  editingItem?: NaatShareef | null;
}

// You can keep these interfaces if you have a separate Taleemat form
export interface naatTaleematFormData extends NaatShareefFormData {}
export interface Naat_TaleematFormProps extends NaatShareefFormProps {}
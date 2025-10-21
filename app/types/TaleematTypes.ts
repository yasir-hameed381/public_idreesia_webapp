export interface Taleemat {
    id: string;
    title: string;
    title_en: string;
    title_ur: string;
    author: string;
    category: string;
    language: string;
    publishDate: string;
    content: string;
    published: string;
  }
  
  export interface TaleematFormData {
    is_published: boolean;
    category: string;
    author: string;
    language: string;
    title_en: string;
    title_ur: string;
    content: string;
  }
  
  export interface TaleematFormProps {
    type: "Taleemat";
    customFieldLabels?: Record<string, string>;
    onCancel: () => void;
    onSubmit?: (data: Omit<Taleemat, "id">) => void;
    onAddNewData: (data: Omit<Taleemat, "id">) => Promise<Taleemat>;
    onUpdateData?: (data: Omit<Taleemat, "id">) => Promise<Taleemat | null>;
    editingItem?: Taleemat | null;
  }
  
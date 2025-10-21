import { DataTablePageEvent } from "primereact/datatable";

export interface Wazaif {
  id?: number;
  title_en: string;
  title_ur: string;
  slug: string;
  description: string;
  images: string | string[]; 
  is_published?: number;
  created_at?: string; 
  updated_at?: string; 
  created_by?: number;
  updated_by?: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}


export  interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number | string; 
  to: number;
  total: number;
}

export interface WazaifApiResponse {
  data: Wazaif[];
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export  interface WazaifTableProps {
  data?: WazaifApiResponse;
  isLoading: boolean;
  error?:any;
  page: number;
  pageSize: number;
   onPageChange: (event: DataTablePageEvent) => void;
  onEdit: (wazaif: Wazaif) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  selectedWazaif: Wazaif | null;
  onSelectionChange: (value: Wazaif) => void;
}


export interface WazaifResponse {
  data: Wazaif[];
   links: {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}
  meta: {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number | string; 
  to: number;
  total: number;
}

}
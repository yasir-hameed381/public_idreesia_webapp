export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

export interface UserWithPermissions {
  id: number | string;
  name: string;
  email: string;
  is_super_admin: boolean;
  is_mehfil_admin: boolean;
  is_zone_admin: boolean;
  is_region_admin?: boolean;
  is_all_region_admin?: boolean;
  zone_id?: number;
  mehfil_directory_id?: number;
  region_id?: number;
  zone?: {
    id: number;
    title_en: string;
    city_en: string;
    country_en: string;
  };
  role: Role | null;
  // Array of all roles (for users with multiple roles)
  roles?: Role[];
}

// Common permission names
export const PERMISSIONS = {
  // User management
  VIEW_USERS: "view users",
  CREATE_USERS: "create users",
  EDIT_USERS: "edit users",
  DELETE_USERS: "delete users",

  // Role management
  VIEW_ROLES: "view roles",
  CREATE_ROLES: "create roles",
  EDIT_ROLES: "edit roles",
  DELETE_ROLES: "delete roles",

  // Permission management
  VIEW_PERMISSIONS: "view permissions",
  ASSIGN_PERMISSIONS: "assign permissions",

  // Categories
  VIEW_CATEGORIES: "view categories",
  CREATE_CATEGORIES: "create categories",
  EDIT_CATEGORIES: "edit categories",
  DELETE_CATEGORIES: "delete categories",

  // Mehfils
  VIEW_MEHFILS: "view mehfils",
  CREATE_MEHFILS: "create mehfils",
  EDIT_MEHFILS: "edit mehfils",
  DELETE_MEHFILS: "delete mehfils",

  // Naats
  VIEW_NAATS: "view naats",
  CREATE_NAATS: "create naats",
  EDIT_NAATS: "edit naats",
  DELETE_NAATS: "delete naats",

  // Taleemat
  VIEW_TALEEMAT: "view taleemat",
  CREATE_TALEEMAT: "create taleemat",
  EDIT_TALEEMAT: "edit taleemat",
  DELETE_TALEEMAT: "delete taleemat",

  // Parhaiyan
  VIEW_PARHAIYAN: "view parhaiyan",
  CREATE_PARHAIYAN: "create parhaiyan",
  EDIT_PARHAIYAN: "edit parhaiyan",
  DELETE_PARHAIYAN: "delete parhaiyan",

  // Zones
  VIEW_ZONES: "view zones",
  CREATE_ZONES: "create zones",
  EDIT_ZONES: "edit zones",
  DELETE_ZONES: "delete zones",

  // Wazaifs
  VIEW_WAZAIFS: "view wazaifs",
  CREATE_WAZAIFS: "create wazaifs",
  EDIT_WAZAIFS: "edit wazaifs",
  DELETE_WAZAIFS: "delete wazaifs",

  // Ehad Karkun
  VIEW_EHAD_KARKUN: "view ehad karkun",
  CREATE_EHAD_KARKUN: "create ehad karkun",
  EDIT_EHAD_KARKUN: "edit ehad karkun",
  DELETE_EHAD_KARKUN: "delete ehad karkun",

  // Karkunan (regular karkun)
  VIEW_KARKUNAN: "view karkunan",
  CREATE_KARKUNAN: "create karkunan",
  EDIT_KARKUNAN: "edit karkunan",
  DELETE_KARKUNAN: "delete karkunan",

  // Mehfil Directory
  VIEW_MEHFIL_DIRECTORY: "view mehfil directory",
  CREATE_MEHFIL_DIRECTORY: "create mehfil directory",
  EDIT_MEHFIL_DIRECTORY: "edit mehfil directory",
  DELETE_MEHFIL_DIRECTORY: "delete mehfil directory",

  // Tags
  VIEW_TAGS: "view tags",
  DELETE_TAGS: "delete tags",

  // File Upload
  UPLOAD_FILE: "upload file",

  // Dashboard
  VIEW_DASHBOARD: "view dashboard",

  // Mehfil Reports
  VIEW_MEHFIL_REPORTS: "view mehfil reports",
  CREATE_MEHFIL_REPORTS: "create mehfil reports",
  EDIT_MEHFIL_REPORTS: "edit mehfil reports",
  DELETE_MEHFIL_REPORTS: "delete mehfil reports",

  // Namaz
  VIEW_NAMAZ: "view namaz",

  // Messages
  VIEW_MESSAGES: "view messages",
  CREATE_MESSAGES: "create messages",
  EDIT_MESSAGES: "edit messages",
  DELETE_MESSAGES: "delete messages",

  // Feedback
  VIEW_FEEDBACK: "view feedback",
  CREATE_FEEDBACK: "create feedback",
  EDIT_FEEDBACK: "edit feedback",
  DELETE_FEEDBACK: "delete feedback",

  // Legacy permissions for backward compatibility
  VIEW_CONTENT: "view-content",
  CREATE_CONTENT: "create-content",
  EDIT_CONTENT: "edit-content",
  DELETE_CONTENT: "delete-content",

  // Karkun management
  VIEW_KARKUNS: "view-karkuns",
  CREATE_KARKUNS: "create-karkuns",
  EDIT_KARKUNS: "edit-karkuns",
  DELETE_KARKUNS: "delete-karkuns",

  // Reports
  VIEW_REPORTS: "view-reports",
  GENERATE_REPORTS: "generate-reports",

  // Settings
  VIEW_SETTINGS: "view-settings",
  EDIT_SETTINGS: "edit-settings",

  // Tabarukats
  VIEW_TABARUKATS: "view tabarukats",
  CREATE_TABARUKATS: "create tabarukats",
  EDIT_TABARUKATS: "edit tabarukats",
  DELETE_TABARUKATS: "delete tabarukats",

  // New Ehads
  VIEW_NEW_EHADS: "view new ehads",
  CREATE_NEW_EHADS: "create new ehads",
  EDIT_NEW_EHADS: "edit new ehads",
  DELETE_NEW_EHADS: "delete new ehads",

  // Duty Types
  VIEW_DUTY_TYPES: "view duty types",
  CREATE_DUTY_TYPES: "create duty types",
  EDIT_DUTY_TYPES: "edit duty types",
  DELETE_DUTY_TYPES: "delete duty types",

  // Duty Roster
  VIEW_DUTY_ROSTER: "view duty roster",
  CREATE_DUTY_ROSTER: "create duty roster",
  EDIT_DUTY_ROSTER: "edit duty roster",
  DELETE_DUTY_ROSTER: "delete duty roster",

  // Coordinators
  VIEW_COORDINATORS: "view coordinators",
  CREATE_COORDINATORS: "create coordinators",
  EDIT_COORDINATORS: "edit coordinators",
  DELETE_COORDINATORS: "delete coordinators",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
  ],
  ROLE_MANAGEMENT: [
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.CREATE_ROLES,
    PERMISSIONS.EDIT_ROLES,
    PERMISSIONS.DELETE_ROLES,
  ],
  PERMISSION_MANAGEMENT: [
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.ASSIGN_PERMISSIONS,
  ],
  CONTENT_MANAGEMENT: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
  ],
  MEHFIL_MANAGEMENT: [
    PERMISSIONS.VIEW_MEHFILS,
    PERMISSIONS.CREATE_MEHFILS,
    PERMISSIONS.EDIT_MEHFILS,
    PERMISSIONS.DELETE_MEHFILS,
  ],
  KARKUN_MANAGEMENT: [
    PERMISSIONS.VIEW_KARKUNS,
    PERMISSIONS.CREATE_KARKUNS,
    PERMISSIONS.EDIT_KARKUNS,
    PERMISSIONS.DELETE_KARKUNS,
  ],
  ZONE_MANAGEMENT: [
    PERMISSIONS.VIEW_ZONES,
    PERMISSIONS.CREATE_ZONES,
    PERMISSIONS.EDIT_ZONES,
    PERMISSIONS.DELETE_ZONES,
  ],
  REPORTS: [PERMISSIONS.VIEW_REPORTS, PERMISSIONS.GENERATE_REPORTS],
  SETTINGS: [PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.EDIT_SETTINGS],
  TABARUKAT_MANAGEMENT: [
    PERMISSIONS.VIEW_TABARUKATS,
    PERMISSIONS.CREATE_TABARUKATS,
    PERMISSIONS.EDIT_TABARUKATS,
    PERMISSIONS.DELETE_TABARUKATS,
  ],
  NEW_EHAD_MANAGEMENT: [
    PERMISSIONS.VIEW_NEW_EHADS,
    PERMISSIONS.CREATE_NEW_EHADS,
    PERMISSIONS.EDIT_NEW_EHADS,
    PERMISSIONS.DELETE_NEW_EHADS,
  ],
  DUTY_TYPE_MANAGEMENT: [
    PERMISSIONS.VIEW_DUTY_TYPES,
    PERMISSIONS.CREATE_DUTY_TYPES,
    PERMISSIONS.EDIT_DUTY_TYPES,
    PERMISSIONS.DELETE_DUTY_TYPES,
  ],
  DUTY_ROSTER_MANAGEMENT: [
    PERMISSIONS.VIEW_DUTY_ROSTER,
    PERMISSIONS.CREATE_DUTY_ROSTER,
    PERMISSIONS.EDIT_DUTY_ROSTER,
    PERMISSIONS.DELETE_DUTY_ROSTER,
  ],
  COORDINATOR_MANAGEMENT: [
    PERMISSIONS.VIEW_COORDINATORS,
    PERMISSIONS.CREATE_COORDINATORS,
    PERMISSIONS.EDIT_COORDINATORS,
    PERMISSIONS.DELETE_COORDINATORS,
  ],
  MEHFIL_DIRECTORY_MANAGEMENT: [
    PERMISSIONS.VIEW_MEHFIL_DIRECTORY,
    PERMISSIONS.CREATE_MEHFIL_DIRECTORY,
    PERMISSIONS.EDIT_MEHFIL_DIRECTORY,
    PERMISSIONS.DELETE_MEHFIL_DIRECTORY,
  ],
} as const;

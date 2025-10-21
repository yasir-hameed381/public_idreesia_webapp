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
  role: Role | null;
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
  VIEW_ZONES: "view zone",
  CREATE_ZONES: "create zone",
  EDIT_ZONES: "edit zone",
  DELETE_ZONES: "delete zone",

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
} as const;

export const APP_TYPES = [
  { value: 'idreesia_app', label: 'Idreesia App' },
  { value: 'idreesia_media_app', label: 'Idreesia Media App' },
] as const;

export type AppType = typeof APP_TYPES[number]['value'];


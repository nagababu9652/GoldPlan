export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
];

export const DEFAULT_EMPTY_MESSAGE =
  "No records found.";

export const DEFAULT_SEARCH_PLACEHOLDER =
  "Search...";

export const TABLE_DENSITY = {
  compact: "compact",

  comfortable: "comfortable",

  spacious: "spacious",
} as const;

export const EXPORT_TYPES = {
  CSV: "csv",

  EXCEL: "excel",

  PDF: "pdf",

  PRINT: "print",
} as const;

export const COLUMN_SIZES = {
  xs: 60,

  sm: 120,

  md: 180,

  lg: 260,

  xl: 360,
} as const;
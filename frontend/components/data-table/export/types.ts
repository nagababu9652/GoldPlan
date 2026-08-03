export type ExportType =
  | "csv"
  | "excel"
  | "pdf"
  | "print";

export interface ExportColumn<T = unknown> {
  key: keyof T | string;
  header: string;
}

export interface ExportOptions<T = unknown> {
  fileName: string;

  columns: ExportColumn<T>[];

  rows: T[];

  sheetName?: string;

  title?: string;

  includeDate?: boolean;
}
import * as XLSX from "xlsx";

import { ExportOptions } from "./types";

import { mapRows } from "./exportHelpers";

export function exportExcel<T>({
  rows,
  columns,
  fileName,
  sheetName = "Sheet1",
}: ExportOptions<T>) {
  const worksheet =
    XLSX.utils.json_to_sheet(
      mapRows(rows, columns)
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
  );

  XLSX.writeFile(
    workbook,
    `${fileName}.xlsx`
  );
}
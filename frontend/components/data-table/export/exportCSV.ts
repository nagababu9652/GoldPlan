import { ExportOptions } from "./types";

export function exportCSV<T>({
  rows,
  columns,
  fileName,
}: ExportOptions<T>) {
  const headers =
    columns.map((x) => x.header);

  const csvRows = rows.map((row) =>
    columns
      .map(
        (c) =>
          row[c.key as keyof T] ?? ""
      )
      .join(",")
  );

  const csv = [
    headers.join(","),

    ...csvRows,
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url =
    window.URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download = `${fileName}.csv`;

  a.click();

  URL.revokeObjectURL(url);
}
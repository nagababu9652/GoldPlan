import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { ExportOptions } from "./types";

export function exportPDF<T>({
  rows,
  columns,
  fileName,
  title,
}: ExportOptions<T>) {
  const doc = new jsPDF();

  if (title) {
    doc.setFontSize(18);

    doc.text(title, 14, 18);
  }

  autoTable(doc, {
    head: [
      columns.map((c) => c.header),
    ],

    body: rows.map((row) =>
      columns.map(
        (c) =>
          row[c.key as keyof T]
      )
    ),

    startY: 28,
  });

  doc.save(`${fileName}.pdf`);
}
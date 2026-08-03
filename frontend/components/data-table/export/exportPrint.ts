import { ExportOptions } from "./types";

export function exportPrint<T>({
  rows,
  columns,
  title,
}: ExportOptions<T>) {
  const html = `
    <html>

    <head>

      <title>${title}</title>

    </head>

    <body>

      <h2>${title}</h2>

      <table border="1" cellspacing="0" cellpadding="6">

      <thead>

      <tr>

      ${columns
        .map(
          (c) =>
            `<th>${c.header}</th>`
        )
        .join("")}

      </tr>

      </thead>

      <tbody>

      ${rows
        .map(
          (row) => `
        <tr>

        ${columns
          .map(
            (c) =>
              `<td>${
                row[
                  c.key as keyof T
                ]
              }</td>`
          )
          .join("")}

        </tr>`
        )
        .join("")}

      </tbody>

      </table>

    </body>

    </html>
  `;

  const printWindow =
    window.open();

  if (!printWindow) return;

  printWindow.document.write(html);

  printWindow.document.close();

  printWindow.print();
}
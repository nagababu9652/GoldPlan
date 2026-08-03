export function mapRows<T>(
  rows: T[],
  columns: {
    key: keyof T | string;
    header: string;
  }[]
) {
  return rows.map((row) => {
    const result: Record<string, unknown> =
      {};

    columns.forEach((column) => {
      result[column.header] =
        row[column.key as keyof T];
    });

    return result;
  });
}
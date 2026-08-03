"use client";

import DataTableRowActions from "../row-actions/DataTableRowActions";
import { RowAction } from "../row-actions";

interface Props<T> {
  row: T;
  actions: RowAction<T>[];
}

export default function ActionColumn<T>({
  row,
  actions,
}: Props<T>) {
  return (
    <DataTableRowActions
      row={row}
      actions={actions}
    />
  );
}
"use client";

import DataTableRowActions from "../actions/DataTableRowActions";
import { RowAction } from "../actions";

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
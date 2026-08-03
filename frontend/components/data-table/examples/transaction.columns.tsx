import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { transactionActions } from "./transaction.actions";
import { Transaction } from "./transaction.types";

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "schemeName",
    header: "Scheme",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <CurrencyColumn value={row.original.amount} />,
  },
  {
    accessorKey: "units",
    header: "Units",
  },
  {
    accessorKey: "nav",
    header: "NAV",
    cell: ({ row }) => <CurrencyColumn value={row.original.nav} />,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateColumn value={row.original.date} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={transactionActions} />
    ),
  },
];
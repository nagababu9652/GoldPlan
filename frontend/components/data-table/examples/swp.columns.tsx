import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  DateColumn,
  ProgressColumn,
  ActionColumn,
} from "@/components/data-table";

import { swpActions } from "./swp.actions";
import { SWP } from "./swp.types";

export const swpColumns: ColumnDef<SWP>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "schemeName",
    header: "Scheme",
  },
  {
    accessorKey: "amc",
    header: "AMC",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <CurrencyColumn value={row.original.amount} />,
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
  },
  {
    accessorKey: "completedInstallments",
    header: "Progress",
    cell: ({ row }) => (
      <ProgressColumn
        value={Math.round(
          (row.original.completedInstallments / row.original.installments) * 100
        )}
      />
    ),
  },
  {
    accessorKey: "nextDate",
    header: "Next Date",
    cell: ({ row }) => <DateColumn value={row.original.nextDate} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={swpActions} />
    ),
  },
];
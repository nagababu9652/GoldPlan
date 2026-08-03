import { ColumnDef } from "@tanstack/react-table";

import {
  AvatarColumn,
  StatusColumn,
  CurrencyColumn,
  ActionColumn,
} from "@/components/data-table";

import { portfolioActions } from "./portfolio.actions";
import { Portfolio } from "./portfolio.types";

export const portfolioColumns: ColumnDef<Portfolio>[] = [
  {
    accessorKey: "name",
    header: "Portfolio",
    cell: ({ row }) => (
      <AvatarColumn
        name={row.original.name}
        image={row.original.customerName}
      />
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "customerPan",
    header: "PAN",
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => <CurrencyColumn value={row.original.totalValue} />,
  },
  {
    accessorKey: "investedAmount",
    header: "Invested",
    cell: ({ row }) => <CurrencyColumn value={row.original.investedAmount} />,
  },
  {
    accessorKey: "returnsPercent",
    header: "Returns %",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={portfolioActions} />
    ),
  },
];
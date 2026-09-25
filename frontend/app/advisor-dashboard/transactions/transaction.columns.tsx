import { ColumnDef } from "@tanstack/react-table";

import {
  CurrencyColumn,
  DateColumn,
  StatusColumn,
  ActionColumn,
} from "@/components/data-table";

import { RowAction } from "@/components/data-table/actions";
import { AdvisorTransaction } from "./transaction.service";

export const transactionColumns = (
  actions: RowAction<AdvisorTransaction>[]
): ColumnDef<AdvisorTransaction>[] => [
  {
    accessorKey: "customer_id",
    header: "Customer ID",
  },

  {
    accessorKey: "transaction_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.transaction_type.toLowerCase()}
      </span>
    ),
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <CurrencyColumn
        value={Number(row.original.amount)}
      />
    ),
  },

  {
    accessorKey: "transaction_date",
    header: "Date",
    cell: ({ row }) => (
      <DateColumn
        value={row.original.transaction_date}
      />
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusColumn
        value={row.original.status}
      />
    ),
  },

  {
  id: "actions",
  cell: ({ row }) => (
    <ActionColumn
      row={row.original}
      actions={actions}
    />
  ),
},
];
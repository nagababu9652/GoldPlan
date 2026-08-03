import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  ActionColumn,
} from "@/components/data-table";

import { mutualFundActions } from "./mutual-fund.actions";
import { MutualFund } from "./mutual-fund.types";

export const mutualFundColumns: ColumnDef<MutualFund>[] = [
  {
    accessorKey: "schemeName",
    header: "Scheme",
  },
  {
    accessorKey: "amc",
    header: "AMC",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "nav",
    header: "NAV",
    cell: ({ row }) => <CurrencyColumn value={row.original.nav} />,
  },
  {
    accessorKey: "aum",
    header: "AUM",
    cell: ({ row }) => <CurrencyColumn value={row.original.aum} />,
  },
  {
    accessorKey: "expenseRatio",
    header: "Expense Ratio",
  },
  {
    accessorKey: "returns1Y",
    header: "1Y Returns",
  },
  {
    accessorKey: "returns3Y",
    header: "3Y Returns",
  },
  {
    accessorKey: "returns5Y",
    header: "5Y Returns",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={mutualFundActions} />
    ),
  },
];
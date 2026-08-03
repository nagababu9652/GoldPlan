import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  ActionColumn,
} from "@/components/data-table";

import { productActions } from "./product.actions";
import { Product } from "./product.types";

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "provider",
    header: "Provider",
  },
  {
    accessorKey: "minInvestment",
    header: "Min Investment",
    cell: ({ row }) => <CurrencyColumn value={row.original.minInvestment} />,
  },
  {
    accessorKey: "expectedReturns",
    header: "Expected Returns %",
  },
  {
    accessorKey: "lockInPeriod",
    header: "Lock-in (Years)",
  },
  {
    accessorKey: "riskLevel",
    header: "Risk Level",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={productActions} />
    ),
  },
];
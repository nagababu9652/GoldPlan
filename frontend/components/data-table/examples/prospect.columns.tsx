import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  ProgressColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { prospectActions } from "./prospect.actions";
import { Prospect } from "./prospect.types";

export const prospectColumns: ColumnDef<Prospect>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <CurrencyColumn value={row.original.revenue} />,
  },
  {
    accessorKey: "employees",
    header: "Employees",
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => (
      <ProgressColumn value={row.original.probability} />
    ),
  },
  {
    accessorKey: "expectedCloseDate",
    header: "Expected Close",
    cell: ({ row }) => <DateColumn value={row.original.expectedCloseDate} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={prospectActions} />
    ),
  },
];
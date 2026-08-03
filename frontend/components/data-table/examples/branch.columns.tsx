import { ColumnDef } from "@tanstack/react-table";

import { StatusColumn, ActionColumn } from "@/components/data-table";

import { branchActions } from "./branch.actions";
import { Branch } from "./branch.types";

export const branchColumns: ColumnDef<Branch>[] = [
  {
    accessorKey: "name",
    header: "Branch",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "manager",
    header: "Manager",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "userCount",
    header: "Users",
  },
  {
    accessorKey: "customerCount",
    header: "Customers",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={branchActions} />
    ),
  },
];
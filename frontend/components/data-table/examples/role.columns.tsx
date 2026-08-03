import { ColumnDef } from "@tanstack/react-table";

import { StatusColumn, ActionColumn } from "@/components/data-table";

import { roleActions } from "./role.actions";
import { Role } from "./role.types";

export const roleColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Role",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => row.original.permissions.length,
  },
  {
    accessorKey: "userCount",
    header: "Users",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={roleActions} />
    ),
  },
];
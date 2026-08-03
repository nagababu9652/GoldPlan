import { ColumnDef } from "@tanstack/react-table";

import {
  AvatarColumn,
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { userActions } from "./user.actions";
import { User } from "./user.types";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <AvatarColumn
        name={row.original.name}
        image={row.original.photo}
      />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) =>
      row.original.lastLogin ? (
        <DateColumn value={row.original.lastLogin} />
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={userActions} />
    ),
  },
];
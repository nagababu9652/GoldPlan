import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { leadActions } from "./lead.actions";
import { Lead } from "./lead.types";

export const leadColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      row.original.createdAt ? (
        <DateColumn value={row.original.createdAt} />
      ) : (
        "—"
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={leadActions} />
    ),
  },
];
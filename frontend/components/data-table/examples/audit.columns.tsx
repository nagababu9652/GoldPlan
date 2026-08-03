import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { auditActions } from "./audit.actions";
import { Audit } from "./audit.types";

export const auditColumns: ColumnDef<Audit>[] = [
  {
    accessorKey: "userName",
    header: "User",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "module",
    header: "Module",
  },
  {
    accessorKey: "details",
    header: "Details",
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      row.original.createdAt ? (
        <DateColumn value={row.original.createdAt} />
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
      <ActionColumn row={row.original} actions={auditActions} />
    ),
  },
];
import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { notificationActions } from "./notification.actions";
import { Notification } from "./notification.types";

export const notificationColumns: ColumnDef<Notification>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "recipient",
    header: "Recipient",
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    cell: ({ row }) =>
      row.original.sentAt ? (
        <DateColumn value={row.original.sentAt} />
      ) : (
        "—"
      ),
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={notificationActions} />
    ),
  },
];
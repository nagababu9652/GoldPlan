import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { meetingActions } from "./meeting.actions";
import { Meeting } from "./meeting.types";

export const meetingColumns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateColumn value={row.original.date} />,
  },
  {
    accessorKey: "duration",
    header: "Duration (min)",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "attendees",
    header: "Attendees",
    cell: ({ row }) => row.original.attendees.length,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={meetingActions} />
    ),
  },
];
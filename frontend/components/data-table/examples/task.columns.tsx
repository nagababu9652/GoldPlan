import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { taskActions } from "./task.actions";
import { Task } from "./task.types";

export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <StatusColumn value={row.original.priority} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => <DateColumn value={row.original.dueDate} />,
  },
  {
    accessorKey: "reminderAt",
    header: "Reminder",
    cell: ({ row }) =>
      row.original.reminderAt ? (
        <DateColumn value={row.original.reminderAt} />
      ) : (
        "—"
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={taskActions} />
    ),
  },
];
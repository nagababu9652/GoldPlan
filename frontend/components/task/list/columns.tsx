"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Task } from "@/lib/api";

function formatDateTime(value: string) {
  const date = new Date(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(task: Task) {
  if (task.status === "COMPLETED") return false;

  return new Date(task.due_at).getTime() < Date.now();
}

function priorityClass(priority: string) {
  switch (priority.toUpperCase()) {
    case "HIGH":
      return "bg-red-100 text-red-700";

    case "LOW":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="min-w-[220px]">
          <Link
            href={`/advisor-dashboard/tasks/${task.id}`}
            className="font-medium hover:underline"
          >
            {task.title}
          </Link>

          <div className="mt-1 text-xs text-muted-foreground">
            {task.task_type}
          </div>
        </div>
      );
    },
  },

  {
    id: "customer",
    header: "Client / Group",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="min-w-[160px]">
          <div className="font-medium">
            {task.customer_name || task.group_name || "—"}
          </div>

          {task.customer_name && task.group_name && (
            <div className="text-xs text-muted-foreground">
              {task.group_name}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "due_at",
    header: "Due",
    cell: ({ row }) => {
      const task = row.original;
      const overdue = isOverdue(task);

      return (
        <div className={overdue ? "text-red-600" : ""}>
          <div className="font-medium">
            {formatDateTime(task.due_at)}
          </div>

          {overdue && (
            <div className="mt-1 text-xs font-medium">
              Overdue
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;

      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
            priority
          )}`}
        >
          {priority}
        </span>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
            status
          )}`}
        >
          {status.replace(/_/g, " ")}
        </span>
      );
    },
  },
];
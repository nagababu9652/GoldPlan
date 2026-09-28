"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Message } from "@/lib/api";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string) {
  switch (status) {
    case "SENT":
      return "bg-blue-100 text-blue-700";

    case "READ":
      return "bg-green-100 text-green-700";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export const messageColumns: ColumnDef<Message>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const message = row.original;

      return (
        <div className="min-w-[220px]">
          <Link
            href={`/advisor-dashboard/messages/${message.id}`}
            className="font-medium hover:underline"
          >
            {message.subject || "(No subject)"}
          </Link>

          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {message.body}
          </div>
        </div>
      );
    },
  },

  {
    id: "recipient",
    header: "Client / Group",
    cell: ({ row }) => {
      const message = row.original;

      return (
        <div className="min-w-[160px]">
          {message.customer_name ? (
            <div className="font-medium">{message.customer_name}</div>
          ) : null}

          {message.group_name ? (
            <div className="font-medium">{message.group_name}</div>
          ) : null}

          {!message.customer_name && !message.group_name ? (
            <span className="text-muted-foreground">—</span>
          ) : null}
        </div>
      );
    },
  },

  {
    accessorKey: "message_type",
    header: "Type",
    cell: ({ row }) => {
      const value = row.original.message_type;

      return (
        <span className="text-sm">
          {value
            ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
            : "—"}
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
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
            status,
          )}`}
        >
          {status.replace(/_/g, " ")}
        </span>
      );
    },
  },

  {
    accessorKey: "sent_at",
    header: "Sent At",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.sent_at)}
      </span>
    ),
  },

  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const message = row.original;

      return (
        <div className="flex items-center gap-3">
          <Link
            href={`/advisor-dashboard/messages/${message.id}`}
            className="text-sm font-medium hover:underline"
          >
            View
          </Link>

          <Link
            href={`/advisor-dashboard/messages/${message.id}/edit`}
            className="text-sm font-medium hover:underline"
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
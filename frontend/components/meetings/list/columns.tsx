"use client";

import Link from "next/link";

import type { Message } from "@/lib/api";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function statusClass(status: string) {
  switch (status) {
    case "SENT":
      return "bg-blue-100 text-blue-700";

    case "READ":
      return "bg-green-100 text-green-700";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

export const messageColumns = [
  {
    key: "subject",
    header: "Subject",
    render: (message: Message) => (
      <Link
        href={`/advisor-dashboard/messages/${message.id}`}
        className="font-medium hover:underline"
      >
        {message.subject || "(No subject)"}
      </Link>
    ),
  },

  {
    key: "recipient",
    header: "Client / Group",
    render: (message: Message) => (
      <div className="space-y-0.5">
        <div className="font-medium">
          {message.customer_name ||
            message.group_name ||
            "—"}
        </div>
      </div>
    ),
  },

  {
    key: "message_type",
    header: "Type",
    render: (message: Message) => (
      <span className="text-sm">
        {message.message_type}
      </span>
    ),
  },

  {
    key: "status",
    header: "Status",
    render: (message: Message) => (
      <span
        className={[
          "inline-flex rounded-full px-2.5 py-1",
          "text-xs font-medium",
          statusClass(message.status),
        ].join(" ")}
      >
        {message.status}
      </span>
    ),
  },

  {
    key: "sent_at",
    header: "Sent At",
    render: (message: Message) => (
      <span className="text-sm text-ash">
        {formatDate(message.sent_at)}
      </span>
    ),
  },

  {
    key: "actions",
    header: "Actions",
    render: (message: Message) => (
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
    ),
  },
];
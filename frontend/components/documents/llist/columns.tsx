"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { Document } from "@/lib/api";

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return "-";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "UPLOADED":
      return "bg-emerald-50 text-emerald-700";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-600";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-blue-50 text-blue-700";
  }
}

export const documentColumns: ColumnDef<Document>[] = [
  {
    accessorKey: "document_name",
    header: "Document",
    cell: ({ row }) => (
      <Link
        href={`/advisor-dashboard/documents/${row.original.id}`}
        className="font-medium text-gray-900 hover:text-blue-600"
      >
        {row.original.document_name}
      </Link>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.document_type || "-"}
      </span>
    ),
  },
  {
    id: "customer",
    header: "Customer / Group",
    cell: ({ row }) => {
      const document = row.original;

      return (
        <div>
          <div className="font-medium text-gray-900">
            {document.customer_name ||
              document.group_name ||
              "-"}
          </div>

          {document.customer_name && document.group_name && (
            <div className="text-xs text-gray-500">
              {document.group_name}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "file_name",
    header: "File",
    cell: ({ row }) => (
      <span className="text-gray-600">
        {row.original.file_name || "-"}
      </span>
    ),
  },
  {
    accessorKey: "file_size",
    header: "Size",
    cell: ({ row }) =>
      formatSize(row.original.file_size),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
          row.original.status,
        )}`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      formatDate(row.original.created_at),
  },
];
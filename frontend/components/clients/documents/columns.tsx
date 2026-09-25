"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import { ClientDocument } from "./types";

const variants = {
  Verified: "success",
  Pending: "warning",
  Expired: "danger",
} as const;

export const documentColumns: ColumnDef<ClientDocument>[] = [
  {
    accessorKey: "name",
    header: "Document",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "fileType",
    header: "Type",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "uploadedOn",
    header: "Uploaded",
  },
  {
    accessorKey: "uploadedBy",
    header: "Uploaded By",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={variants[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
];
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import { Goal } from "./types";

const variants = {
  "On Track": "success",
  "Needs Attention": "warning",
  "Achieved": "secondary",
} as const;

export const goalColumns: ColumnDef<Goal>[] = [
  {
    accessorKey: "name",
    header: "Goal",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "targetAmount",
    header: "Target",
    cell: ({ row }) =>
      `₹${row.original.targetAmount.toLocaleString("en-IN")}`,
  },
  {
    accessorKey: "currentAmount",
    header: "Current",
    cell: ({ row }) =>
      `₹${row.original.currentAmount.toLocaleString("en-IN")}`,
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => `${row.original.progress}%`,
  },
  {
    accessorKey: "targetDate",
    header: "Target Date",
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
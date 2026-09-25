"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import ClientRowActions from "./ClientRowActions";
import type { Client } from "@/lib/api";

const statusVariant = {
  ACTIVE: "success",
  INACTIVE: "secondary",
} as const;

const riskVariant = {
  CONSERVATIVE: "secondary",
  MODERATE: "warning",
  AGGRESSIVE: "danger",
} as const;

function formatCurrency(value?: number | null) {
  if (value == null) return "—";

  return `₹ ${value.toLocaleString("en-IN")}`;
}

function formatRisk(value?: string | null) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const clientColumns: ColumnDef<Client>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,

    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={() =>
          table.toggleAllPageRowsSelected(
            !table.getIsAllPageRowsSelected()
          )
        }
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={() =>
          row.toggleSelected(!row.getIsSelected())
        }
      />
    ),
  },

  {
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <div className="font-medium text-obsidian">
          {row.original.name || "Unnamed Client"}
        </div>

        <div className="mt-1 text-xs text-ash">
          {row.original.customer_code}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "occupation",
    header: "Occupation",
    cell: ({ row }) =>
      row.original.occupation || "—",
  },

  {
    accessorKey: "annual_income",
    header: "Annual Income",
    cell: ({ row }) =>
      formatCurrency(row.original.annual_income),
  },

  {
    accessorKey: "net_worth",
    header: "Net Worth",
    cell: ({ row }) =>
      formatCurrency(row.original.net_worth),
  },

  {
    accessorKey: "risk_profile",
    header: "Risk",
    cell: ({ row }) => {
      const risk = row.original.risk_profile?.toUpperCase();

      if (!risk) {
        return <span className="text-ash">—</span>;
      }

      const variant =
        riskVariant[risk as keyof typeof riskVariant] ??
        "secondary";

      return (
        <Badge variant={variant}>
          {formatRisk(row.original.risk_profile)}
        </Badge>
      );
    },
  },

  {
    accessorKey: "resident_status",
    header: "Resident",
    cell: ({ row }) =>
      row.original.resident_status || "—",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toUpperCase();

      const variant =
        statusVariant[status as keyof typeof statusVariant] ??
        "secondary";

      return (
        <Badge variant={variant}>
          {formatStatus(row.original.status)}
        </Badge>
      );
    },
  },

  {
    accessorKey: "onboarding_date",
    header: "Onboarded",
    cell: ({ row }) => {
      const date = row.original.onboarding_date;

      if (!date) {
        return <span className="text-ash">—</span>;
      }

      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },

  {
    id: "actions",
    enableSorting: false,

    cell: ({ row }) => (
      <ClientRowActions client={row.original} />
    ),
  },
];
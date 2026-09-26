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
    id: "client",
    accessorKey: "first_name",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original;

      const fullName = [
        client.first_name,
        client.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div className="min-w-[200px]">
          <div className="font-medium text-obsidian">
            {fullName || "Unnamed Client"}
          </div>

          <div className="mt-1 text-xs text-ash">
            {client.email || client.phone || "No contact details"}
          </div>
        </div>
      );
    },
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
    accessorKey: "kyc_status",
    header: "KYC",
    cell: ({ row }) => {
      const kycStatus =
        row.original.kyc_status?.toUpperCase();

      if (!kycStatus) {
        return <span className="text-ash">—</span>;
      }

      const variant =
        kycStatus === "VERIFIED"
          ? "success"
          : "secondary";

      return (
        <Badge variant={variant}>
          {formatStatus(row.original.kyc_status)}
        </Badge>
      );
    },
  },

  {
    id: "status",
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.is_active
        ? "ACTIVE"
        : "INACTIVE";

      return (
        <Badge variant={statusVariant[status]}>
          {formatStatus(status)}
        </Badge>
      );
    },
  },

  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.created_at;

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

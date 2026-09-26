"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Client } from "@/lib/api";

import {
  ClientAvatarCell,
  ClientStatusBadge,
  ClientRowActions,
} from ".";

export const clientColumns = (
  onView: (clientId: string) => void
): ColumnDef<Client>[] => [
  {
    id: "name",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original;

      const name =
        `${client.first_name} ${client.last_name}`.trim();

      return (
        <ClientAvatarCell
          name={name}
          email={client.email ?? ""}
        />
      );
    },
  },

  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "—",
  },

  {
    accessorKey: "group_name",
    header: "Group",
    cell: ({ row }) => row.original.group_name ?? "—",
  },

  {
    accessorKey: "risk_profile",
    header: "Risk",
    cell: ({ row }) => row.original.risk_profile ?? "—",
  },

  {
    id: "kyc_status",
    header: "KYC",
    cell: ({ row }) => row.original.kyc_status ?? "—",
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <ClientStatusBadge
        status={row.original.is_active ? "ACTIVE" : "INACTIVE"}
      />
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <ClientRowActions
        clientId={String(row.original.id)}
        onView={onView}
      />
    ),
  },
];
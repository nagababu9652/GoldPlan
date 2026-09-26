"use client";

import { useRouter } from "next/navigation";

import {
  Eye,
  Pencil,
  FolderOpen,
  Receipt,
  FileText,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import type { Client } from "@/lib/api";

interface Props {
  client: Client;
}

export default function ClientRowActions({
  client,
}: Props) {
  const router = useRouter();

  const clientName =
    [client.first_name, client.last_name]
      .filter(Boolean)
      .join(" ") || "Unnamed Client";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Actions for ${clientName}`}
        >
          ⋮
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/advisor-dashboard/clients/${client.id}`
            )
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/advisor-dashboard/clients/${client.id}/edit`
            )
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/advisor-dashboard/clients/${client.id}/portfolio`
            )
          }
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Portfolio
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/advisor-dashboard/clients/${client.id}/transactions`
            )
          }
        >
          <Receipt className="mr-2 h-4 w-4" />
          Transactions
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/advisor-dashboard/clients/${client.id}/documents`
            )
          }
        >
          <FileText className="mr-2 h-4 w-4" />
          Documents
        </DropdownMenuItem>

        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
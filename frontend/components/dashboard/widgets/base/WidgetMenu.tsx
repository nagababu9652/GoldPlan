"use client";

import {
  MoreHorizontal,
  RefreshCw,
  Maximize2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WidgetMenu() {
  return (
    <DropdownMenu>

      <DropdownMenuTrigger asChild>

        <button className="rounded-lg p-2 hover:bg-muted">

          <MoreHorizontal className="h-5 w-5" />

        </button>

      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">

        <DropdownMenuItem>

          <RefreshCw className="mr-2 h-4 w-4" />

          Refresh

        </DropdownMenuItem>

        <DropdownMenuItem>

          <Maximize2 className="mr-2 h-4 w-4" />

          Full Screen

        </DropdownMenuItem>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}
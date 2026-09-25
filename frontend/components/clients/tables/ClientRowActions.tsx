"use client";

import {
  Eye,
  Pencil,
  Trash,
} from "lucide-react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown";

import { Button } from "@/components/ui/button";

interface Props {
  clientId: string;
}

export default function ClientRowActions({
  clientId,
}: Props) {
  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          •••
        </Button>
      </DropdownTrigger>

      <DropdownContent align="end">
        <DropdownItem>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownItem>

        <DropdownItem>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownItem>

        <DropdownItem className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
"use client";

import {
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown";

import { RowAction } from "./row-actions.types";

interface Props<TData> {
  row: TData;

  actions: RowAction<TData>[];
}

export default function DataTableRowActions<TData>({
  row,
  actions,
}: Props<TData>) {
  return (
    <Dropdown>

      <DropdownTrigger asChild>

        <Button
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal size={18} />
        </Button>

      </DropdownTrigger>

      <DropdownContent align="end">

        {actions
          .filter((x) => !x.hidden)
          .map((action) => (
            <DropdownItem
              key={action.id}
              disabled={action.disabled}
              onClick={() =>
                action.onClick(row)
              }
            >
              {action.icon}

              <span>{action.label}</span>

            </DropdownItem>
          ))}

      </DropdownContent>

    </Dropdown>
  );
}
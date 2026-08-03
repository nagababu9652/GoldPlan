import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { SWP } from "./swp.types";

export const swpActions: RowAction<SWP>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (swp: SWP) => {
      console.log("View SWP:", swp.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (swp: SWP) => {
      console.log("Edit SWP:", swp.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (swp: SWP) => {
      console.log("History for SWP:", swp.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (swp: SWP) => {
      console.log("Delete SWP:", swp.id);
    },
  },
];
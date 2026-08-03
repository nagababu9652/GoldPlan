import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Branch } from "./branch.types";

export const branchActions: RowAction<Branch>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (branch: Branch) => {
      console.log("View branch:", branch.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (branch: Branch) => {
      console.log("Edit branch:", branch.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (branch: Branch) => {
      console.log("History for branch:", branch.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (branch: Branch) => {
      console.log("Delete branch:", branch.id);
    },
  },
];
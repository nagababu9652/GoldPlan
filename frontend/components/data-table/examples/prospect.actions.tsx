import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Prospect } from "./prospect.types";

export const prospectActions: RowAction<Prospect>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (prospect: Prospect) => {
      console.log("View prospect:", prospect.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (prospect: Prospect) => {
      console.log("Edit prospect:", prospect.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (prospect: Prospect) => {
      console.log("History for prospect:", prospect.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (prospect: Prospect) => {
      console.log("Delete prospect:", prospect.id);
    },
  },
];
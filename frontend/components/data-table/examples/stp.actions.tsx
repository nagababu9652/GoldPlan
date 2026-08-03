import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { STP } from "./stp.types";

export const stpActions: RowAction<STP>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (stp: STP) => {
      console.log("View STP:", stp.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (stp: STP) => {
      console.log("Edit STP:", stp.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (stp: STP) => {
      console.log("History for STP:", stp.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (stp: STP) => {
      console.log("Delete STP:", stp.id);
    },
  },
];
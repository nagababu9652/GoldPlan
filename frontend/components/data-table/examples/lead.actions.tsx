import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Lead } from "./lead.types";

export const leadActions: RowAction<Lead>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (lead: Lead) => {
      console.log("View lead:", lead.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (lead: Lead) => {
      console.log("Edit lead:", lead.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (lead: Lead) => {
      console.log("History for lead:", lead.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (lead: Lead) => {
      console.log("Delete lead:", lead.id);
    },
  },
];
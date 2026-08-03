import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Portfolio } from "./portfolio.types";

export const portfolioActions: RowAction<Portfolio>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (portfolio: Portfolio) => {
      console.log("View portfolio:", portfolio.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (portfolio: Portfolio) => {
      console.log("Edit portfolio:", portfolio.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (portfolio: Portfolio) => {
      console.log("History for portfolio:", portfolio.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (portfolio: Portfolio) => {
      console.log("Delete portfolio:", portfolio.id);
    },
  },
];
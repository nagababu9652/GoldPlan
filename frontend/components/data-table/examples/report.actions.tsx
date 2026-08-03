import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Report } from "./report.types";

export const reportActions: RowAction<Report>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (report: Report) => {
      console.log("View report:", report.id);
    },
  },
  {
    id: "edit",
    label: "Regenerate",
    icon: <Pencil size={16} />,
    onClick: (report: Report) => {
      console.log("Regenerate report:", report.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (report: Report) => {
      console.log("History for report:", report.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (report: Report) => {
      console.log("Delete report:", report.id);
    },
  },
];
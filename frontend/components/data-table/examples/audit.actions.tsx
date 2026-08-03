import { Eye, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Audit } from "./audit.types";

export const auditActions: RowAction<Audit>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (audit: Audit) => {
      console.log("View audit:", audit.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (audit: Audit) => {
      console.log("History for audit:", audit.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (audit: Audit) => {
      console.log("Delete audit:", audit.id);
    },
  },
];
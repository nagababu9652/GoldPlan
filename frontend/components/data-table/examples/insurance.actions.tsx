import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Insurance } from "./insurance.types";

export const insuranceActions: RowAction<Insurance>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (insurance: Insurance) => {
      console.log("View insurance:", insurance.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (insurance: Insurance) => {
      console.log("Edit insurance:", insurance.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (insurance: Insurance) => {
      console.log("History for insurance:", insurance.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (insurance: Insurance) => {
      console.log("Delete insurance:", insurance.id);
    },
  },
];
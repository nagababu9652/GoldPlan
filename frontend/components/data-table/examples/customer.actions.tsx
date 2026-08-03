import {
  Eye,
  Pencil,
  Trash2,
  History,
} from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Customer } from "./customer.types";

export const customerActions: RowAction<Customer>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (customer: Customer) => {
      console.log("View customer:", customer.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (customer: Customer) => {
      console.log("Edit customer:", customer.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (customer: Customer) => {
      console.log("History for customer:", customer.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (customer: Customer) => {
      console.log("Delete customer:", customer.id);
    },
  },
];
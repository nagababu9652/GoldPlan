import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Transaction } from "./transaction.types";

export const transactionActions: RowAction<Transaction>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (transaction: Transaction) => {
      console.log("View transaction:", transaction.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (transaction: Transaction) => {
      console.log("Edit transaction:", transaction.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (transaction: Transaction) => {
      console.log("History for transaction:", transaction.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (transaction: Transaction) => {
      console.log("Delete transaction:", transaction.id);
    },
  },
];
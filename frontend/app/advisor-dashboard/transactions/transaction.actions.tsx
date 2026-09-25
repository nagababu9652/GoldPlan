import {
  Eye,
  Pencil,
  Trash2,
  History,
} from "lucide-react";

import { RowAction } from "@/components/data-table/actions";
import { AdvisorTransaction } from "./transaction.service";

interface TransactionActionHandlers {
  onView: (transaction: AdvisorTransaction) => void;
  onEdit: (transaction: AdvisorTransaction) => void;
  onHistory: (transaction: AdvisorTransaction) => void;
  onDelete: (transaction: AdvisorTransaction) => void;
}

export function createTransactionActions({
  onView,
  onEdit,
  onHistory,
  onDelete,
}: TransactionActionHandlers): RowAction<AdvisorTransaction>[] {
  return [
    {
      id: "view",
      label: "View",
      icon: <Eye size={16} />,
      onClick: onView,
    },
    {
      id: "edit",
      label: "Edit",
      icon: <Pencil size={16} />,
      onClick: onEdit,
    },
    {
      id: "history",
      label: "History",
      icon: <History size={16} />,
      onClick: onHistory,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 size={16} />,
      variant: "danger",
      onClick: onDelete,
    },
  ];
}
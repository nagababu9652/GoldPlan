import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { MutualFund } from "./mutual-fund.types";

export const mutualFundActions: RowAction<MutualFund>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (mutualFund: MutualFund) => {
      console.log("View mutual fund:", mutualFund.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (mutualFund: MutualFund) => {
      console.log("Edit mutual fund:", mutualFund.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (mutualFund: MutualFund) => {
      console.log("History for mutual fund:", mutualFund.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (mutualFund: MutualFund) => {
      console.log("Delete mutual fund:", mutualFund.id);
    },
  },
];
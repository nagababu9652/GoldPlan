import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { SIP } from "./sip.types";

export const sipActions: RowAction<SIP>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (sip: SIP) => {
      console.log("View SIP:", sip.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (sip: SIP) => {
      console.log("Edit SIP:", sip.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (sip: SIP) => {
      console.log("History for SIP:", sip.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (sip: SIP) => {
      console.log("Delete SIP:", sip.id);
    },
  },
];
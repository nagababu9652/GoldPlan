import { Eye, Trash2 } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Notification } from "./notification.types";

export const notificationActions: RowAction<Notification>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (notification: Notification) => {
      console.log("View notification:", notification.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (notification: Notification) => {
      console.log("Delete notification:", notification.id);
    },
  },
];
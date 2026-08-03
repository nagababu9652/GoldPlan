import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { User } from "./user.types";

export const userActions: RowAction<User>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (user: User) => {
      console.log("View user:", user.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (user: User) => {
      console.log("Edit user:", user.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (user: User) => {
      console.log("History for user:", user.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (user: User) => {
      console.log("Delete user:", user.id);
    },
  },
];
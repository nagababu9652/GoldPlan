import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Role } from "./role.types";

export const roleActions: RowAction<Role>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (role: Role) => {
      console.log("View role:", role.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (role: Role) => {
      console.log("Edit role:", role.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (role: Role) => {
      console.log("History for role:", role.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (role: Role) => {
      console.log("Delete role:", role.id);
    },
  },
];
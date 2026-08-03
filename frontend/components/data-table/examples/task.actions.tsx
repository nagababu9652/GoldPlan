import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Task } from "./task.types";

export const taskActions: RowAction<Task>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (task: Task) => {
      console.log("View task:", task.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (task: Task) => {
      console.log("Edit task:", task.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (task: Task) => {
      console.log("History for task:", task.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (task: Task) => {
      console.log("Delete task:", task.id);
    },
  },
];
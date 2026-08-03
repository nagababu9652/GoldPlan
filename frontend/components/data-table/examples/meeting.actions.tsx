import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Meeting } from "./meeting.types";

export const meetingActions: RowAction<Meeting>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (meeting: Meeting) => {
      console.log("View meeting:", meeting.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (meeting: Meeting) => {
      console.log("Edit meeting:", meeting.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (meeting: Meeting) => {
      console.log("History for meeting:", meeting.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (meeting: Meeting) => {
      console.log("Delete meeting:", meeting.id);
    },
  },
];
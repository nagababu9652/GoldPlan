import { DataTableFilter } from "@/components/data-table";

export const taskFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "In Progress", value: "in-progress" },
      { label: "Completed", value: "completed" },
      { label: "Overdue", value: "overdue" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Urgent", value: "urgent" },
    ],
  },
];
import { DataTableFilter } from "@/components/data-table";

export const sipFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Paused", value: "paused" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
  {
    id: "frequency",
    label: "Frequency",
    type: "select",
    options: [
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Weekly", value: "weekly" },
      { label: "Daily", value: "daily" },
    ],
  },
];
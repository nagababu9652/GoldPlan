import { DataTableFilter } from "@/components/data-table";

export const meetingFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Scheduled", value: "scheduled" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
      { label: "No-show", value: "no-show" },
    ],
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "In-person", value: "in-person" },
      { label: "Video", value: "video" },
      { label: "Phone", value: "phone" },
    ],
  },
];
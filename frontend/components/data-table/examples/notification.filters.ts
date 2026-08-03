import { DataTableFilter } from "@/components/data-table";

export const notificationFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Sent", value: "sent" },
      { label: "Failed", value: "failed" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Info", value: "info" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" },
    ],
  },
  {
    id: "channel",
    label: "Channel",
    type: "select",
    options: [
      { label: "Email", value: "email" },
      { label: "SMS", value: "sms" },
      { label: "Push", value: "push" },
      { label: "In-App", value: "in-app" },
    ],
  },
];
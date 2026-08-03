import { DataTableFilter } from "@/components/data-table";

export const transactionFilters: DataTableFilter[] = [
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Buy", value: "buy" },
      { label: "Sell", value: "sell" },
      { label: "Dividend", value: "dividend" },
      { label: "Switch", value: "switch" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Completed", value: "completed" },
      { label: "Failed", value: "failed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
  {
    id: "dateRange",
    label: "Date Range",
    type: "date-range",
  },
];
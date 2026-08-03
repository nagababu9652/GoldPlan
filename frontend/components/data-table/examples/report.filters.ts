import { DataTableFilter } from "@/components/data-table";

export const reportFilters: DataTableFilter[] = [
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "AUM", value: "aum" },
      { label: "Transaction", value: "transaction" },
      { label: "Commission", value: "commission" },
      { label: "Client", value: "client" },
      { label: "Performance", value: "performance" },
      { label: "Compliance", value: "compliance" },
    ],
  },
  {
    id: "format",
    label: "Format",
    type: "select",
    options: [
      { label: "PDF", value: "pdf" },
      { label: "Excel", value: "excel" },
      { label: "CSV", value: "csv" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Generated", value: "generated" },
      { label: "Pending", value: "pending" },
      { label: "Failed", value: "failed" },
    ],
  },
];
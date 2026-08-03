import { DataTableFilter } from "@/components/data-table";

export const auditFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Success", value: "success" },
      { label: "Failed", value: "failed" },
      { label: "Warning", value: "warning" },
    ],
  },
  {
    id: "module",
    label: "Module",
    type: "select",
    options: [
      { label: "Customers", value: "customers" },
      { label: "Portfolio", value: "portfolio" },
      { label: "Transactions", value: "transactions" },
      { label: "Users", value: "users" },
      { label: "Reports", value: "reports" },
    ],
  },
];
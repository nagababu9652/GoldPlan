import { DataTableFilter } from "@/components/data-table";

export const productFilters: DataTableFilter[] = [
  {
    id: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "Mutual Fund", value: "mutual-fund" },
      { label: "Insurance", value: "insurance" },
      { label: "Bond", value: "bond" },
      { label: "Fixed Deposit", value: "fd" },
      { label: "NPS", value: "nps" },
    ],
  },
  {
    id: "riskLevel",
    label: "Risk Level",
    type: "select",
    options: [
      { label: "Low", value: "low" },
      { label: "Moderate", value: "moderate" },
      { label: "High", value: "high" },
      { label: "Very High", value: "very-high" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];
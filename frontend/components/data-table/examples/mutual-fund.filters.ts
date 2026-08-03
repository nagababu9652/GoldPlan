import { DataTableFilter } from "@/components/data-table";

export const mutualFundFilters: DataTableFilter[] = [
  {
    id: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "Equity", value: "equity" },
      { label: "Debt", value: "debt" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Liquid", value: "liquid" },
      { label: "ELSS", value: "elss" },
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
  {
    id: "amc",
    label: "AMC",
    type: "select",
    options: [
      { label: "HDFC AMC", value: "hdfc-amc" },
      { label: "ICICI Prudential", value: "icici-prudential" },
      { label: "SBI Mutual Fund", value: "sbi-mutual-fund" },
      { label: "Axis Mutual Fund", value: "axis-mutual-fund" },
    ],
  },
];
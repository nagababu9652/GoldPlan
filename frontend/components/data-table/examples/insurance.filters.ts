import { DataTableFilter } from "@/components/data-table";

export const insuranceFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Lapsed", value: "lapsed" },
      { label: "Matured", value: "matured" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
  {
    id: "policyType",
    label: "Policy Type",
    type: "select",
    options: [
      { label: "Term", value: "term" },
      { label: "Whole Life", value: "whole-life" },
      { label: "Endowment", value: "endowment" },
      { label: "ULIP", value: "ulip" },
      { label: "Health", value: "health" },
    ],
  },
  {
    id: "insurer",
    label: "Insurer",
    type: "select",
    options: [
      { label: "LIC", value: "lic" },
      { label: "HDFC Life", value: "hdfc-life" },
      { label: "ICICI Prudential", value: "icici-prudential" },
      { label: "SBI Life", value: "sbi-life" },
    ],
  },
];
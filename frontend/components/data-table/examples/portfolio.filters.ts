import { DataTableFilter } from "@/components/data-table";

export const portfolioFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    id: "branch",
    label: "Branch",
    type: "select",
    options: [
      { label: "Mumbai", value: "mumbai" },
      { label: "Delhi", value: "delhi" },
      { label: "Bangalore", value: "bangalore" },
    ],
  },
];
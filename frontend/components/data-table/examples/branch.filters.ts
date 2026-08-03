import { DataTableFilter } from "@/components/data-table";

export const branchFilters: DataTableFilter[] = [
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
    id: "state",
    label: "State",
    type: "select",
    options: [
      { label: "Maharashtra", value: "maharashtra" },
      { label: "Delhi", value: "delhi" },
      { label: "Karnataka", value: "karnataka" },
      { label: "Tamil Nadu", value: "tamil-nadu" },
    ],
  },
];
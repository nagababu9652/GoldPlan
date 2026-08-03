import { DataTableFilter } from "@/components/data-table";

export const userFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  {
    id: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Advisor", value: "advisor" },
      { label: "Manager", value: "manager" },
      { label: "Operator", value: "operator" },
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
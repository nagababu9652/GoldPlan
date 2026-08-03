import { DataTableFilter } from "@/components/data-table";

export const customerFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      {
        label: "Active",
        value: "active",
      },
      {
        label: "Inactive",
        value: "inactive",
      },
    ],
  },
  {
    id: "branch",
    label: "Branch",
    type: "select",
    options: [
      {
        label: "Mumbai",
        value: "mumbai",
      },
      {
        label: "Delhi",
        value: "delhi",
      },
      {
        label: "Bangalore",
        value: "bangalore",
      },
    ],
  },
  {
    id: "rm",
    label: "Relationship Manager",
    type: "select",
    options: [
      {
        label: "Raj Sharma",
        value: "raj-sharma",
      },
      {
        label: "Priya Patel",
        value: "priya-patel",
      },
    ],
  },
];
import { DataTableFilter } from "@/components/data-table";

export const prospectFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "New", value: "new" },
      { label: "Qualified", value: "qualified" },
      { label: "Proposal", value: "proposal" },
      { label: "Negotiation", value: "negotiation" },
      { label: "Won", value: "won" },
      { label: "Lost", value: "lost" },
    ],
  },
  {
    id: "industry",
    label: "Industry",
    type: "select",
    options: [
      { label: "Technology", value: "technology" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Finance", value: "finance" },
      { label: "Manufacturing", value: "manufacturing" },
    ],
  },
];
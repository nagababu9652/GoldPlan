import { DataTableFilter } from "@/components/data-table";

export const leadFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "New", value: "new" },
      { label: "Contacted", value: "contacted" },
      { label: "Qualified", value: "qualified" },
      { label: "Converted", value: "converted" },
      { label: "Lost", value: "lost" },
    ],
  },
  {
    id: "source",
    label: "Source",
    type: "select",
    options: [
      { label: "Website", value: "website" },
      { label: "Referral", value: "referral" },
      { label: "Social", value: "social" },
      { label: "Campaign", value: "campaign" },
      { label: "Walk-in", value: "walk-in" },
    ],
  },
];
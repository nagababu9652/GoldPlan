"use client";

import { SelectFilter } from "@/components/data-table/filters";

export default function ClientFilters() {
  return (
    <div className="flex flex-wrap gap-3">

      <SelectFilter
        placeholder="Status"
        options={[
          {
            label: "All",
            value: "all",
          },
          {
            label: "Active",
            value: "Active",
          },
          {
            label: "Inactive",
            value: "Inactive",
          },
          {
            label: "Prospect",
            value: "Prospect",
          },
        ]}
      />

      <SelectFilter
        placeholder="Risk"
        options={[
          {
            label: "All",
            value: "all",
          },
          {
            label: "Conservative",
            value: "Conservative",
          },
          {
            label: "Moderate",
            value: "Moderate",
          },
          {
            label: "Aggressive",
            value: "Aggressive",
          },
        ]}
      />

    </div>
  );
}
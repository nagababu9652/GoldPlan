"use client";

import { SelectFilter } from "@/components/data-table/filters";

export default function ClientFilters({status,risk,onStatusChange,onRiskChange}:{status:string;risk:string;onStatusChange:(value:string)=>void;onRiskChange:(value:string)=>void}) {
  return (
    <div className="flex flex-wrap gap-3">

      <SelectFilter
        value={status}
        onChange={onStatusChange}
        placeholder="Status"
        options={[
          {
            label: "All",
            value: "all",
          },
          {
            label: "Active",
            value: "ACTIVE",
          },
          {
            label: "Inactive",
            value: "INACTIVE",
          },
          {
            label: "Prospect",
            value: "PROSPECT",
          },
        ]}
      />

      <SelectFilter
        value={risk}
        onChange={onRiskChange}
        placeholder="Risk"
        options={[
          {
            label: "All",
            value: "all",
          },
          {
            label: "Conservative",
            value: "CONSERVATIVE",
          },
          {
            label: "Moderate",
            value: "MODERATE",
          },
          {
            label: "Aggressive",
            value: "AGGRESSIVE",
          },
        ]}
      />

    </div>
  );
}

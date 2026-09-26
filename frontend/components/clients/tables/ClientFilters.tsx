"use client";

import { Select } from "@/components/ui/select";

interface ClientFiltersProps {
  status: string;
  risk: string;

  onStatusChange: (value: string) => void;
  onRiskChange: (value: string) => void;
}

export default function ClientFilters({
  status,
  risk,
  onStatusChange,
  onRiskChange,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        className="w-40"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: "all", label: "All Status" },
          { value: "ACTIVE", label: "Active" },
          { value: "PROSPECT", label: "Prospect" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "BLOCKED", label: "Blocked" },
        ]}
      />

      <Select
        className="w-40"
        value={risk}
        onChange={(e) => onRiskChange(e.target.value)}
        options={[
          { value: "all", label: "All Risk" },
          { value: "Low", label: "Low" },
          { value: "Moderate", label: "Moderate" },
          { value: "High", label: "High" },
        ]}
      />
    </div>
  );
}
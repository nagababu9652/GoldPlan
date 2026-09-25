"use client";

import { Select } from "@/components/ui/select";

interface ClientFiltersProps {
  advisor: string;
  status: string;
  risk: string;

  onAdvisorChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRiskChange: (value: string) => void;
}

export default function ClientFilters({
  advisor,
  status,
  risk,
  onAdvisorChange,
  onStatusChange,
  onRiskChange,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">

      <Select
        className="w-48"
        value={advisor}
        onChange={(e) => onAdvisorChange(e.target.value)}
        options={[
          { value: "all", label: "All Advisors" },
          { value: "Naga", label: "Naga" },
          { value: "Suresh", label: "Suresh" },
        ]}
      />

      <Select
        className="w-40"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { value: "all", label: "All" },
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
          { value: "all", label: "All" },
          { value: "Low", label: "Low" },
          { value: "Moderate", label: "Moderate" },
          { value: "High", label: "High" },
        ]}
      />

    </div>
  );
}
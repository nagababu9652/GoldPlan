"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

      <Select value={advisor} onValueChange={onAdvisorChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Advisor" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Advisors</SelectItem>
          <SelectItem value="Naga">Naga</SelectItem>
          <SelectItem value="Suresh">Suresh</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PROSPECT">Prospect</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
        </SelectContent>
      </Select>

      <Select value={risk} onValueChange={onRiskChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Risk" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Moderate">Moderate</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

    </div>
  );
}
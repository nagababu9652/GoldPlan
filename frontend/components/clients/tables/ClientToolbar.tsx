"use client";

import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ClientFilters } from ".";

interface ClientToolbarProps {
  search: string;
  status: string;
  risk: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRiskChange: (value: string) => void;

  onAddClient?: () => void;
  onExport?: () => void;
}

export default function ClientToolbar({
  search,
  status,
  risk,
  onSearchChange,
  onStatusChange,
  onRiskChange,
  onAddClient,
  onExport,
}: ClientToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Input
          className="w-full lg:max-w-sm"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button onClick={onAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <ClientFilters
        status={status}
        risk={risk}
        onStatusChange={onStatusChange}
        onRiskChange={onRiskChange}
      />
    </div>
  );
}
"use client";

import { Switch } from "@/components/ui/switch";

interface BooleanFilterProps {
  checked: boolean;
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export default function BooleanFilter({
  checked,
  label = "Enabled",
  onCheckedChange,
}: BooleanFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />

      <span className="text-sm">{label}</span>
    </div>
  );
}
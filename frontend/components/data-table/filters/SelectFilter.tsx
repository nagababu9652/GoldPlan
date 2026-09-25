"use client";

import { Select } from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

interface SelectFilterProps {
  value?: string;
  placeholder?: string;
  options: FilterOption[];
  onChange?: (value: string) => void;
}

export default function SelectFilter({
  value,
  placeholder = "Select...",
  options,
  onChange,
}: SelectFilterProps) {
  return (
    <Select
      className="w-[180px]"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      options={options}
    />
  );
}
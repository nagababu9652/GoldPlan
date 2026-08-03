"use client";

import { Input } from "@/components/ui/input";

interface DateFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function DateFilter({
  value,
  onChange,
}: DateFilterProps) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-[180px]"
    />
  );
}
"use client";

import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full md:max-w-sm"
    />
  );
}
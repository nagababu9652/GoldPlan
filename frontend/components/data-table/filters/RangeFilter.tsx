"use client";

import { Input } from "@/components/ui/input";

interface RangeFilterProps {
  min?: number;
  max?: number;

  onMinChange?: (value: number) => void;
  onMaxChange?: (value: number) => void;
}

export default function RangeFilter({
  min,
  max,
  onMinChange,
  onMaxChange,
}: RangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={min ?? ""}
        placeholder="Min"
        className="w-24"
        onChange={(e) =>
          onMinChange?.(Number(e.target.value))
        }
      />

      <span>-</span>

      <Input
        type="number"
        value={max ?? ""}
        placeholder="Max"
        className="w-24"
        onChange={(e) =>
          onMaxChange?.(Number(e.target.value))
        }
      />
    </div>
  );
}
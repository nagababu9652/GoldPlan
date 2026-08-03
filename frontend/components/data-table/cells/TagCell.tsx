"use client";

import { Badge } from "@/components/ui/badge";

interface TagCellProps {
  tags: string[];
}

export default function TagCell({
  tags,
}: TagCellProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
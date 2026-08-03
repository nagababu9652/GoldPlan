"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarCellProps {
  name: string;
  image?: string;
  description?: string;
}

export default function AvatarCell({
  name,
  image,
  description,
}: AvatarCellProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>

        {description && (
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
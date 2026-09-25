"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  name: string;
  email: string;
}

export default function ClientAvatarCell({
  name,
  email,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="" alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}
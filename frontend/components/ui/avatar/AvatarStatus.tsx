"use client";

import { cn } from "@/lib/utils";
import { AvatarStatus as Status } from "./avatar.types";

interface AvatarStatusProps {
  status?: Status;
}

const colors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

export default function AvatarStatus({
  status = "offline",
}: AvatarStatusProps) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
        colors[status]
      )}
    />
  );
}
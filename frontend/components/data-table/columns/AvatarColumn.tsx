"use client";

import { Avatar } from "@/components/ui/avatar";

interface Props {
  name: string;
  image?: string;
}

export default function AvatarColumn({
  name,
  image,
}: Props) {
  return (
    <div className="flex items-center gap-3">

      <Avatar
        src={image}
        alt={name}
      />

      <div>

        <div className="font-medium">
          {name}
        </div>

      </div>

    </div>
  );
}
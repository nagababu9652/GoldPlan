"use client";

import AvatarCell from "./AvatarCell";

interface UserCellProps {
  name: string;
  email: string;
  image?: string;
}

export default function UserCell({
  name,
  email,
  image,
}: UserCellProps) {
  return (
    <AvatarCell
      name={name}
      image={image}
      description={email}
    />
  );
}
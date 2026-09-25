"use client";

import { Eye } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function ViewAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="View"
      icon={<Eye size={16} />}
      onClick={onClick}
    />
  );
}
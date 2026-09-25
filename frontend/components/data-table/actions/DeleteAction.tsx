"use client";

import { Trash2 } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function DeleteAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="Delete"
      icon={<Trash2 size={16} />}
      variant="danger"
      onClick={onClick}
    />
  );
}
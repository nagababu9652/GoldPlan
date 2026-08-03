"use client";

import { Pencil } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function EditAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="Edit"
      icon={<Pencil size={16} />}
      onClick={onClick}
    />
  );
}
"use client";

import { Copy } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function DuplicateAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="Duplicate"
      icon={<Copy size={16} />}
      onClick={onClick}
    />
  );
}
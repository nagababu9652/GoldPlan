"use client";

import { History } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function HistoryAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="History"
      icon={<History size={16} />}
      onClick={onClick}
    />
  );
}
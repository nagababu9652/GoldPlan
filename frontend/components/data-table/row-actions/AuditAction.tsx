"use client";

import { ShieldCheck } from "lucide-react";
import ActionItem from "./ActionItem";

interface Props {
  onClick: () => void;
}

export default function AuditAction({
  onClick,
}: Props) {
  return (
    <ActionItem
      label="Audit Log"
      icon={<ShieldCheck size={16} />}
      onClick={onClick}
    />
  );
}
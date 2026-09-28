"use client";

import { useParams } from "next/navigation";
import { MessageDetail } from "@/components/messages/detail/index";

export default function MessageDetailPage() {
  const params = useParams();

  const id = Number(params.id);

  return <MessageDetail id={id} />;
}
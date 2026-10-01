"use client";

import { useParams } from "next/navigation";
import ClientGoals from "@/components/clients/goals/ClientGoals";

export default function GoalsPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientGoals clientId={Number(id)} />;
}

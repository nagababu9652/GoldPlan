"use client";
import { useParams } from "next/navigation";
import ClientGoals from "@/components/clients/goals/ClientGoals";
export default function GroupGoalsPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientGoals groupId={Number(id)} />;
}

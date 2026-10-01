"use client";
import { useParams } from "next/navigation";
import ClientAccounts from "@/components/clients/accounts/ClientAccounts";
export default function GroupAccountsPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientAccounts groupId={Number(id)} />;
}

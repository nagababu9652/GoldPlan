"use client";

import { useParams } from "next/navigation";
import ClientAccounts from "@/components/clients/accounts/ClientAccounts";

export default function ClientAccountsPage() {
  const { id } = useParams<{ id: string }>();
  return <ClientAccounts clientId={Number(id)} />;
}

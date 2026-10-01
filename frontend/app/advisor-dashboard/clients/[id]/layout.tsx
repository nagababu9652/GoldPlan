"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import ClientTabs from "@/components/clients/common/ClientTabs";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <ClientTabs clientId={id} />
      {children}
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import type { Client } from "@/lib/api";

import ClientHeader from "./ClientHeader";

interface ClientLayoutProps {
  client: Client;
  children: ReactNode;
}

export default function ClientLayout({
  client,
  children,
}: ClientLayoutProps) {
  return (
    <div className="space-y-3">
      <ClientHeader client={client} />

      {children}
    </div>
  );
}
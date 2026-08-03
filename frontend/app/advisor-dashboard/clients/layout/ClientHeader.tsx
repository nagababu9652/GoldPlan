"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import ClientAvatar from "./ClientAvatar";

interface ClientHeaderProps {
  name: string;
  clientId: string;
  email?: string;
  phone?: string;
  avatar?: string;
  actions?: ReactNode;
}

export default function ClientHeader({
  name,
  clientId,
  email,
  phone,
  avatar,
  actions,
}: ClientHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-background p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <ClientAvatar
          src={avatar}
          name={name}
          size="xl"
        />

        <div>
          <h1 className="text-2xl font-bold">{name}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Client ID • {clientId}
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {actions}

        <Button>Edit Client</Button>
      </div>
    </div>
  );
}
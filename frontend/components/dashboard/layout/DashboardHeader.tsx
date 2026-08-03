"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;

  subtitle?: string;

  actions?: ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-muted-foreground">
            {subtitle}
          </p>
        )}

      </div>

      <div className="flex items-center gap-3">

        {actions}

        <Button>
          + New
        </Button>

      </div>

    </header>
  );
}
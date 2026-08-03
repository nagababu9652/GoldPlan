"use client";

import { ReactNode } from "react";

interface Props {
  search?: ReactNode;

  filters?: ReactNode;

  actions?: ReactNode;
}

export default function TableToolbar({
  search,
  filters,
  actions,
}: Props) {
  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex-1">

          {search}

        </div>

        {actions}

      </div>

      {filters}

    </div>
  );
}
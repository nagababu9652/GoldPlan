"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ClientFilters from "./ClientFilters";

interface ClientToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
}

export default function ClientToolbar({
  search,
  onSearchChange,
  onRefresh,
}: ClientToolbarProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex flex-1 flex-wrap items-center gap-3">

        <Input
          value={search}
          placeholder="Search clients..."
          className="w-full lg:w-80"
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <ClientFilters />

      </div>

      <div className="flex items-center gap-2">

        <Button
          variant="outline"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>

        <Button
          onClick={() =>
            router.push("/advisor-dashboard/clients/new")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>

      </div>

    </div>
  );
}
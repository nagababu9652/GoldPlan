"use client";

import { SearchX } from "lucide-react";

interface NoResultsProps {
  search?: string;
}

export default function NoResults({
  search,
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="mb-4 h-10 w-10 text-muted-foreground" />

      <h3 className="font-semibold">
        No matching records
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {search
          ? `No results found for "${search}".`
          : "Try changing your filters."}
      </p>
    </div>
  );
}
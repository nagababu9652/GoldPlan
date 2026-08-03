"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onRetry?: () => void;
}

export default function WidgetError({
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-10">

      <TriangleAlert className="mb-3 h-10 w-10 text-destructive" />

      <h4 className="font-semibold">
        Failed to load
      </h4>

      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong.
      </p>

      {onRetry && (
        <Button
          size="sm"
          className="mt-5"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}

    </div>
  );
}
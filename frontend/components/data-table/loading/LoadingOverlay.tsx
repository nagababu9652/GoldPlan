"use client";

import { Loader2 } from "lucide-react";

interface Props {
  message?: string;
}

export default function LoadingOverlay({
  message = "Loading...",
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
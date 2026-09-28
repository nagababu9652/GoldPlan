"use client";

import { Card } from "@/components/ui/card";

export default function UploadDocumentDialog() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">
        Upload Document
      </h3>

      <p className="mt-2 text-muted-foreground">
        File upload integration will be connected during backend implementation.
      </p>
    </Card>
  );
}

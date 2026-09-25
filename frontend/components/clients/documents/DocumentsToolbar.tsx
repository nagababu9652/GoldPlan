"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props {
  onUpload?: () => void;
}

export default function DocumentsToolbar({
  onUpload,
}: Props) {
  return (
    <div className="flex justify-end">

      <Button onClick={onUpload}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>

    </div>
  );
}
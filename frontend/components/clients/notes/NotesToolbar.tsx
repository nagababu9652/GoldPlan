"use client";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

interface Props {
  onNew?: () => void;
}

export default function NotesToolbar({
  onNew,
}: Props) {
  return (
    <div className="flex justify-end">

      <Button onClick={onNew}>
        <Plus className="mr-2 h-4 w-4" />
        New Note
      </Button>

    </div>
  );
}
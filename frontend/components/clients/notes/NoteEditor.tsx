"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NoteEditor() {
  return (
    <Card className="p-6">

      <h2 className="mb-6 text-xl font-semibold">
        Add Note
      </h2>

      <div className="space-y-4">

        <Input placeholder="Title" />

        <Textarea
          rows={6}
          placeholder="Write meeting notes..."
        />

        <Button>
          Save Note
        </Button>

      </div>

    </Card>
  );
}
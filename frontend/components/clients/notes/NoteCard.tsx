"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { Pin } from "lucide-react";

import { ClientNote } from "./types";

interface Props {
  note: ClientNote;
}

export default function NoteCard({ note }: Props) {
  return (
    <Card className="p-5">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="font-semibold">
            {note.title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {note.author} • {note.createdAt}
          </p>

        </div>

        {note.pinned && (
          <Pin className="h-4 w-4 text-primary" />
        )}

      </div>

      <p className="mt-4 whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {note.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
          >
            {tag}
          </Badge>
        ))}
      </div>

    </Card>
  );
}
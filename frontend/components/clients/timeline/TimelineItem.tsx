"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TimelineEvent } from "./types";

interface Props {
  event: TimelineEvent;
}

export default function TimelineItem({ event }: Props) {
  return (
    <Card className="p-5">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="font-semibold">
            {event.title}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {event.description}
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            {event.user} • {event.createdAt}
          </p>

        </div>

        <Badge>
          {event.type}
        </Badge>

      </div>

    </Card>
  );
}
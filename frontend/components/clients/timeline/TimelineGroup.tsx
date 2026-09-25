"use client";

import TimelineItem from "./TimelineItem";
import { TimelineEvent } from "./types";

interface Props {
  title: string;
  events: TimelineEvent[];
}

export default function TimelineGroup({
  title,
  events,
}: Props) {
  return (
    <section className="space-y-4">

      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      {events.map((event) => (
        <TimelineItem
          key={event.id}
          event={event}
        />
      ))}

    </section>
  );
}
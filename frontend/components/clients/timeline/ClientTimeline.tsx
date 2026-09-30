import TimelineFilters from "./TimelineFilters";
import TimelineSummary from "./TimelineSummary";
import TimelineGroup from "./TimelineGroup";
import EmptyTimeline from "./EmptyTimeline";

import { TimelineEvent } from "./types";

interface Props {
  events: TimelineEvent[];
}

export default function ClientTimeline({
  events,
}: Props) {
  const important = events.filter(
    (event) => event.important
  ).length;

  return (
    <div className="space-y-3">

      <TimelineSummary
        total={events.length}
        important={important}
      />

      <TimelineFilters />

      {events.length === 0 ? (
        <EmptyTimeline />
      ) : (
        <TimelineGroup
          title="Recent Activity"
          events={events}
        />
      )}

    </div>
  );
}
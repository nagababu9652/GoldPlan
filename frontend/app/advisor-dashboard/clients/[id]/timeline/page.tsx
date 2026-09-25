import { ClientTimeline } from "@/components/clients/timeline";
import { getTimelineEvents } from "@/components/clients/timeline/api";

export default async function TimelinePage() {
  const events = await getTimelineEvents();

  return <ClientTimeline events={events} />;
}
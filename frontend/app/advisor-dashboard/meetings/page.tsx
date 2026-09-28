import { MeetingTable } from "@/components/meetings/list";

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Meetings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Schedule and manage client meetings, reviews, and follow-ups.
        </p>
      </div>

      <MeetingTable />
    </div>
  );
}
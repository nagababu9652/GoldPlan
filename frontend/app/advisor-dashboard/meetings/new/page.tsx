import Link from "next/link";

import { MeetingForm } from "@/components/meetings/form";

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/advisor-dashboard/meetings"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Meetings
        </Link>

        <h1 className="mt-3 text-3xl font-bold">
          New Meeting
        </h1>

        <p className="mt-2 text-muted-foreground">
          Schedule a new client or group meeting.
        </p>
      </div>

      <MeetingForm />
    </div>
  );
}
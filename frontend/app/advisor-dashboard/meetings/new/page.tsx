import Link from "next/link";

import { MeetingForm } from "@/components/meetings/form";

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <Link
          href="/advisor-dashboard/meetings"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-ash transition-colors hover:text-obsidian"
        >
          ← Back to Meetings
        </Link>

        <div className="dashboard-pill mt-4 border-obsidian/10 bg-obsidian/[0.02]">
          Meeting scheduling
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          New Meeting
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Schedule a new client or group meeting.
        </p>
      </div>

      <MeetingForm />
    </div>
  );
}
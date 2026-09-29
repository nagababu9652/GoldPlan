import { MeetingTable } from "@/components/meetings/list";

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Meeting operations
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Meetings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Schedule and manage client meetings, reviews, and follow-ups.
        </p>
      </div>

      <MeetingTable />
    </div>
  );
}
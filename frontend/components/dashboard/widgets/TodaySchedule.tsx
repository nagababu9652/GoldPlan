"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ArrowRight,
  MapPin,
  Phone,
  Video,
} from "lucide-react";
import {
  getAdvisorTodayMeetings,
  type AdvisorMeeting,
} from "@/lib/api";

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function meetingTypeLabel(
  type: AdvisorMeeting["meeting_type"]
) {
  switch (type) {
    case "in_person":
      return "In Person";
    case "phone":
      return "Phone";
    default:
      return "Virtual";
  }
}

function MeetingTypeIcon({
  type,
}: {
  type: AdvisorMeeting["meeting_type"];
}) {
  switch (type) {
    case "in_person":
      return <MapPin size={13} />;

    case "phone":
      return <Phone size={13} />;

    default:
      return <Video size={13} />;
  }
}

export default function TodaySchedule() {
  const [meetings, setMeetings] = useState<AdvisorMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const response =
          await getAdvisorTodayMeetings(token);

        setMeetings(response.meetings);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load today's meetings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  return (
    <section className="dashboard-panel overflow-hidden bg-bone/80">
      <div className="flex items-end justify-between border-b border-line p-6 lg:p-7">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Today
          </div>

          <h3 className="mt-3 font-serif text-2xl text-obsidian">
            Your schedule
          </h3>

          <p className="mt-1 text-sm text-ash">
            Meetings and client activities
          </p>
        </div>

        {!loading && !error && (
          <span className="shrink-0 rounded-full border border-line bg-white/50 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-ash">
            {meetings.length}{" "}
            {meetings.length === 1
              ? "activity"
              : "activities"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 lg:p-7">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-4"
              >
                <div className="h-3 w-14 rounded bg-ash/10" />

                <div className="flex-1">
                  <div className="h-3 w-3/4 rounded bg-ash/10" />

                  <div className="mt-3 h-2.5 w-1/2 rounded bg-ash/10" />

                  <div className="mt-3 h-5 w-20 rounded-full bg-ash/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line">
              <CalendarDays
                size={18}
                className="text-ash"
              />
            </div>

            <h4 className="mt-4 text-sm font-medium text-obsidian">
              Nothing scheduled
            </h4>

            <p className="mt-2 max-w-xs text-xs leading-5 text-ash">
              You have no meetings or client activities
              scheduled for today.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {meetings.map((meeting, index) => (
              <div
                key={meeting.id}
                className={`relative ${
                  index !== meetings.length - 1
                    ? "border-b border-line"
                    : ""
                } py-5 first:pt-1 last:pb-1`}
              >
                <div className="flex gap-4">
                  {/* Time */}
                  <div className="w-[58px] shrink-0 pt-0.5">
                    <p className="text-xs font-medium text-obsidian">
                      {formatTime(
                        meeting.meeting_time
                      )}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="relative flex w-3 shrink-0 justify-center">
                    <span className="relative z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 border-obsidian bg-bone" />

                    {index !== meetings.length - 1 && (
                      <span className="absolute top-3 h-[calc(100%+1.25rem)] w-px bg-line" />
                    )}
                  </div>

                  {/* Meeting */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-obsidian">
                      {meeting.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-ash">
                      {meeting.client_name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-ash">
                        <MeetingTypeIcon
                          type={meeting.meeting_type}
                        />

                        {meetingTypeLabel(
                          meeting.meeting_type
                        )}
                      </span>

                      <span className="text-[10px] font-medium capitalize text-emerald-700">
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/advisor-dashboard/meetings"
          className="mt-6 flex items-center justify-between border-t border-line pt-5 text-xs font-mono uppercase tracking-[0.18em] text-obsidian transition-opacity hover:opacity-60"
        >
          <span>View all meetings</span>

          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
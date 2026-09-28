"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMeetings, type Meeting } from "@/lib/api";

type MeetingCalendarProps = {
  refreshKey?: number;
};

const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarStart(date: Date) {
  const monthStart = getMonthStart(date);
  return new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    monthStart.getDate() - monthStart.getDay()
  );
}

function getCalendarEnd(date: Date) {
  const monthEnd = getMonthEnd(date);

  return new Date(
    monthEnd.getFullYear(),
    monthEnd.getMonth(),
    monthEnd.getDate() + (6 - monthEnd.getDay())
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    case "RESCHEDULED":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "NO_SHOW":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "SCHEDULED":
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export default function MeetingCalendar({
  refreshKey = 0,
}: MeetingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calendarStart = useMemo(
    () => getCalendarStart(currentMonth),
    [currentMonth]
  );

  const calendarEnd = useMemo(
    () => getCalendarEnd(currentMonth),
    [currentMonth]
  );

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const response = await getMeetings(token, {
        from_date: formatDateKey(calendarStart),
        to_date: formatDateKey(calendarEnd),
      });

      setMeetings(response.meetings);
    } catch (err) {
      console.error("Failed to load calendar meetings:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load calendar meetings."
      );
    } finally {
      setLoading(false);
    }
  }, [calendarStart, calendarEnd]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings, refreshKey]);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const cursor = new Date(calendarStart);

    while (cursor <= calendarEnd) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [calendarStart, calendarEnd]);

  const meetingsByDate = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {};

    for (const meeting of meetings) {
      const date = new Date(meeting.scheduled_start);
      const key = formatDateKey(date);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(meeting);
    }

    for (const key of Object.keys(grouped)) {
      grouped[key].sort(
        (a, b) =>
          new Date(a.scheduled_start).getTime() -
          new Date(b.scheduled_start).getTime()
      );
    }

    return grouped;
  }, [meetings]);

  const todayKey = formatDateKey(new Date());

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function previousMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    setCurrentMonth(new Date());
  }

  return (
    <div className="rounded-2xl border border-line bg-bone overflow-hidden">
      {/* Calendar header */}
      <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-lg transition hover:bg-muted"
            aria-label="Previous month"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-lg transition hover:bg-muted"
            aria-label="Next month"
          >
            ›
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Today
          </button>

          <h2 className="ml-2 text-lg font-semibold">
            {monthLabel}
          </h2>
        </div>

        <button
          type="button"
          onClick={loadMeetings}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="p-10 text-center">
          <p className="text-sm text-ash">
            Loading calendar...
          </p>
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Week headings */}
          <div className="grid grid-cols-7 border-b border-line">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="border-r border-line px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ash last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = formatDateKey(day);
              const dayMeetings = meetingsByDate[dateKey] ?? [];

              const isCurrentMonth =
                day.getMonth() === currentMonth.getMonth();

              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={[
                    "min-h-[150px] border-b border-r border-line p-2",
                    "last:border-r-0",
                    !isCurrentMonth
                      ? "bg-muted/30"
                      : "bg-bone",
                  ].join(" ")}
                >
                  {/* Date number */}
                  <div className="mb-2 flex justify-end">
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                        isToday
                          ? "bg-obsidian font-semibold text-bone"
                          : isCurrentMonth
                            ? "text-foreground"
                            : "text-ash",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Meetings */}
                  <div className="space-y-1.5">
                    {dayMeetings.map((meeting) => (
                      <Link
                        key={meeting.id}
                        href={`/advisor-dashboard/meetings/${meeting.id}`}
                        className={[
                          "block rounded-lg border px-2 py-1.5 text-left",
                          "transition hover:shadow-sm",
                          getStatusClasses(meeting.status),
                        ].join(" ")}
                      >
                        <div className="truncate text-xs font-semibold">
                          {formatTime(meeting.scheduled_start)}
                        </div>

                        <div className="truncate text-xs font-medium">
                          {meeting.title}
                        </div>

                        {(meeting.customer_name ||
                          meeting.group_name) && (
                          <div className="truncate text-[11px] opacity-80">
                            {meeting.customer_name ||
                              meeting.group_name}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
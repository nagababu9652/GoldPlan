    "use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  cancelMeeting,
  completeMeeting,
  type Meeting,
} from "@/lib/api";

type MeetingDetailProps = {
  meeting: Meeting;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char: string) =>
      char.toUpperCase(),
    );
}

function statusClasses(status?: string | null) {
  switch (status?.toUpperCase?.()) {
    case "SCHEDULED":
      return "bg-blue-50 text-blue-700";

    case "COMPLETED":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-700";

    case "RESCHEDULED":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function MeetingDetail({
  meeting,
}: MeetingDetailProps) {
  const router = useRouter();

  const [cancelling, setCancelling] =
    useState(false);
  const [completing, setCompleting] = useState(false);

  const [error, setError] = useState("");

  const canCancel =
    (meeting.status ?? "").toUpperCase() ===
      "SCHEDULED" ||
    (meeting.status ?? "").toUpperCase() ===
      "RESCHEDULED";

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this meeting?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      await cancelMeeting(
        token,
        meeting.id,
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Failed to cancel meeting:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel meeting.",
      );
    } finally {
      setCancelling(false);
    }
  }

  async function handleComplete() {
    try {
      setCompleting(true);
      setError("");
      const token = localStorage.getItem("finplan_token");
      if (!token) {
        setError("Please login.");
        return;
      }
      await completeMeeting(token, meeting.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete meeting.");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                {meeting.title}
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                  meeting.status,
                )}`}
              >
                {formatType(meeting.status)}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {formatType(meeting.meeting_type)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/advisor-dashboard/tasks/new?customer_id=${meeting.customer_id ?? ""}&customer_group_id=${meeting.customer_group_id ?? ""}&title=${encodeURIComponent(`Follow up: ${meeting.title}`)}`}
              className="rounded-lg border border-line bg-bone px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Create Follow-up
            </Link>
            <Link
              href={`/advisor-dashboard/meetings/${meeting.id}/edit`}
              className="rounded-lg border border-line bg-bone px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Edit
            </Link>

            {canCancel && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing || cancelling}
                className="rounded-lg bg-obsidian px-4 py-2.5 text-sm font-medium text-bone transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completing ? "Completing..." : "Mark Complete"}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Meeting"}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-bone p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">
            Meeting Details
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start
              </p>

              <p className="mt-1 text-sm">
                {formatDateTime(
                  meeting.scheduled_start,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                End
              </p>

              <p className="mt-1 text-sm">
                {formatDateTime(
                  meeting.scheduled_end,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Location
              </p>

              <p className="mt-1 text-sm">
                {meeting.location || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Meeting Link
              </p>

              {meeting.meeting_link ? (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm hover:underline"
                >
                  Open meeting link
                </a>
              ) : (
                <p className="mt-1 text-sm">
                  -
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Meeting With
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Client
              </p>

              {meeting.customer_name ? (
                <p className="mt-1 text-sm font-medium">
                  {meeting.customer_name}
                </p>
              ) : (
                <p className="mt-1 text-sm">
                  -
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Group
              </p>

              {meeting.group_name ? (
                <p className="mt-1 text-sm font-medium">
                  {meeting.group_name}
                </p>
              ) : (
                <p className="mt-1 text-sm">
                  -
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {(meeting.description ||
        meeting.notes ||
        meeting.outcome) && (
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Notes & Outcome
          </h2>

          <div className="mt-6 space-y-3">
            {meeting.description && (
              <div>
                <p className="text-sm font-medium">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {meeting.description}
                </p>
              </div>
            )}

            {meeting.notes && (
              <div>
                <p className="text-sm font-medium">
                  Internal Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {meeting.notes}
                </p>
              </div>
            )}

            {meeting.outcome && (
              <div>
                <p className="text-sm font-medium">
                  Outcome
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {meeting.outcome}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

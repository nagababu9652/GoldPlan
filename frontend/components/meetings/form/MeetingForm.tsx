"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createMeeting,
  getClients,
  getGroups,
  updateMeeting,
  type Client,
  type Group,
  type Meeting,
  type MeetingCreatePayload,
  type MeetingUpdatePayload,
} from "@/lib/api";

type MeetingFormProps = {
  meeting?: Meeting;
};

type FormState = {
  title: string;
  meeting_type: string;
  customer_id: string;
  customer_group_id: string;
  scheduled_start: string;
  scheduled_end: string;
  location: string;
  meeting_link: string;
  description: string;
  notes: string;
};

const initialForm: FormState = {
  title: "",
  meeting_type: "REVIEW",
  customer_id: "",
  customer_group_id: "",
  scheduled_start: "",
  scheduled_end: "",
  location: "",
  meeting_link: "",
  description: "",
  notes: "",
};

const meetingTypes = [
  { value: "REVIEW", label: "Review" },
  { value: "PLANNING", label: "Planning" },
  { value: "ONBOARDING", label: "Onboarding" },
  { value: "KYC", label: "KYC" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "SERVICE", label: "Service" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "OTHER", label: "Other" },
];

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export default function MeetingForm({
  meeting,
}: MeetingFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(meeting);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!meeting) {
      return;
    }

    setForm({
      title: meeting.title || "",
      meeting_type: meeting.meeting_type || "REVIEW",

      customer_id: meeting.customer_id
        ? String(meeting.customer_id)
        : "",

      customer_group_id: meeting.customer_group_id
        ? String(meeting.customer_group_id)
        : "",

      scheduled_start: toDateTimeLocal(
        meeting.scheduled_start,
      ),

      scheduled_end: toDateTimeLocal(
        meeting.scheduled_end,
      ),

      location: meeting.location || "",
      meeting_link: meeting.meeting_link || "",
      description: meeting.description || "",
      notes: meeting.notes || "",
    });
  }, [meeting]);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const [
          clientResponse,
          groupResponse,
        ] = await Promise.all([
          getClients(token, {
            page: 1,
            page_size: 100,
          }),
          getGroups(token, {
            include_inactive: false,
          }),
        ]);

        setClients(clientResponse.clients);
        setGroups(groupResponse.groups);
      } catch (err) {
        console.error(
          "Failed to load meeting options:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients and groups.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (!form.scheduled_start) {
      setError(
        "Start date and time are required.",
      );
      return;
    }

    if (!form.scheduled_end) {
      setError(
        "End date and time are required.",
      );
      return;
    }

    const start = new Date(
      form.scheduled_start,
    );

    const end = new Date(
      form.scheduled_end,
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError(
        "Please enter valid meeting dates and times.",
      );
      return;
    }

    if (end <= start) {
      setError(
        "Meeting end time must be after the start time.",
      );
      return;
    }

    if (
      !form.customer_id &&
      !form.customer_group_id
    ) {
      setError(
        "Select either a client or a group for this meeting.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      if (isEditMode && meeting) {
        const payload: MeetingUpdatePayload = {
          title: form.title.trim(),

          meeting_type: form.meeting_type,

          customer_id: form.customer_id
            ? Number(form.customer_id)
            : null,

          customer_group_id:
            form.customer_group_id
              ? Number(form.customer_group_id)
              : null,

          scheduled_start:
            start.toISOString(),

          scheduled_end:
            end.toISOString(),

          location:
            form.location.trim() || null,

          meeting_link:
            form.meeting_link.trim() || null,

          description:
            form.description.trim() || null,

          notes:
            form.notes.trim() || null,
        };

        await updateMeeting(
          token,
          meeting.id,
          payload,
        );

        router.push(
          `/advisor-dashboard/meetings/${meeting.id}`,
        );

        return;
      }

      const payload: MeetingCreatePayload = {
        title: form.title.trim(),

        meeting_type: form.meeting_type,

        customer_id: form.customer_id
          ? Number(form.customer_id)
          : null,

        customer_group_id:
          form.customer_group_id
            ? Number(form.customer_group_id)
            : null,

        scheduled_start:
          start.toISOString(),

        scheduled_end:
          end.toISOString(),

        location:
          form.location.trim() || null,

        meeting_link:
          form.meeting_link.trim() || null,

        description:
          form.description.trim() || null,

        notes:
          form.notes.trim() || null,

        status: "SCHEDULED",
      };

      const createdMeeting =
        await createMeeting(
          token,
          payload,
        );

      router.push(
        `/advisor-dashboard/meetings/${createdMeeting.id}`,
      );
    } catch (err) {
      console.error(
        isEditMode
          ? "Failed to update meeting:"
          : "Failed to create meeting:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "Unable to update meeting."
            : "Unable to create meeting.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Meeting Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the basic details for this meeting.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Meeting title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              placeholder="e.g. Annual portfolio review"
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Meeting type
            </label>

            <select
              value={form.meeting_type}
              onChange={(event) =>
                updateField(
                  "meeting_type",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
            >
              {meetingTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Meeting With
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Associate this meeting with a client or group.
          </p>
        </div>

        {loadingOptions ? (
          <p className="text-sm text-muted-foreground">
            Loading clients and groups...
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Client
              </label>

              <select
                value={form.customer_id}
                onChange={(event) =>
                  updateField(
                    "customer_id",
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
              >
                <option value="">
                  Select client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.first_name}{" "}
                    {client.last_name}
                    {client.customer_code
                      ? ` (${client.customer_code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Group
              </label>

              <select
                value={form.customer_group_id}
                onChange={(event) =>
                  updateField(
                    "customer_group_id",
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
              >
                <option value="">
                  Select group
                </option>

                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.group_name}
                    {group.group_code
                      ? ` (${group.group_code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          You can associate a meeting with a client,
          a group, or both.
        </p>
      </section>

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Date & Time
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Set when the meeting starts and ends.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Start
            </label>

            <input
              type="datetime-local"
              value={form.scheduled_start}
              onChange={(event) =>
                updateField(
                  "scheduled_start",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              End
            </label>

            <input
              type="datetime-local"
              value={form.scheduled_end}
              onChange={(event) =>
                updateField(
                  "scheduled_end",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Location
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a physical location or online meeting link.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value,
                )
              }
              placeholder="e.g. Head Office"
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Meeting link
            </label>

            <input
              type="url"
              value={form.meeting_link}
              onChange={(event) =>
                updateField(
                  "meeting_link",
                  event.target.value,
                )
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-bone p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Notes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add useful context for the meeting.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="What is this meeting about?"
              className="w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Internal notes
            </label>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Add internal notes..."
              className="w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              isEditMode && meeting
                ? `/advisor-dashboard/meetings/${meeting.id}`
                : "/advisor-dashboard/meetings",
            )
          }
          className="rounded-lg border border-line bg-bone px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting || loadingOptions
          }
          className="rounded-lg bg-obsidian px-5 py-2.5 text-sm font-medium text-bone transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create Meeting"}
        </button>
      </div>
    </form>
  );
}
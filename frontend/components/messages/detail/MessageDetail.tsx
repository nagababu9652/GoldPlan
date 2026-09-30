"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  archiveMessage,
  getMessage,
  markMessageRead,
  Message,
} from "@/lib/api";

type Props = {
  id: number;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function getStatusClass(status: string) {
  switch (status) {
    case "SENT":
      return "bg-blue-100 text-blue-700";

    case "READ":
      return "bg-green-100 text-green-700";

    case "ARCHIVED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function MessageDetail({ id }: Props) {
  const router = useRouter();

  const [message, setMessage] =
    useState<Message | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const [actionLoading, setActionLoading] =
    useState(false);

  async function loadMessage() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem(
        "finplan_token",
      );

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      const response = await getMessage(token, id);

      setMessage(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load message.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessage();
  }, [id]);

  async function handleMarkRead() {
    if (!message) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem(
        "finplan_token",
      );

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      const updated = await markMessageRead(
        token,
        message.id,
      );

      setMessage(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark message as read.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleArchive() {
    if (!message) return;

    try {
      setActionLoading(true);

      const token = localStorage.getItem(
        "finplan_token",
      );

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      const updated = await archiveMessage(
        token,
        message.id,
      );

      setMessage(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to archive message.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Loading message...
      </div>
    );
  }

  if (error && !message) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back
        </button>
      </div>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">
              {message.subject || "(No subject)"}
            </h1>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                message.status,
              )}`}
            >
              {message.status}
            </span>
          </div>

          <p className="mt-2 text-muted-foreground">
            {message.message_type}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/advisor-dashboard/messages/${message.id}/edit`}
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          >
            Edit
          </Link>

          {message.status !== "READ" &&
          message.status !== "ARCHIVED" ? (
            <button
              onClick={handleMarkRead}
              disabled={actionLoading}
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Mark Read
            </button>
          ) : null}

          {message.status !== "ARCHIVED" ? (
            <button
              onClick={handleArchive}
              disabled={actionLoading}
              className="h-10 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Archive
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="text-sm font-medium text-muted-foreground">
            Message
          </div>

          <div className="mt-4 whitespace-pre-wrap leading-7">
            {message.body}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            Message Information
          </h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">
                Recipient
              </dt>

              <dd className="mt-1 font-medium">
                {message.customer_name ||
                  message.group_name ||
                  "—"}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                Type
              </dt>

              <dd className="mt-1 font-medium">
                {message.message_type}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                Status
              </dt>

              <dd className="mt-1 font-medium">
                {message.status}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                Sent At
              </dt>

              <dd className="mt-1 font-medium">
                {formatDate(message.sent_at)}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                Read At
              </dt>

              <dd className="mt-1 font-medium">
                {formatDate(message.read_at)}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                Created At
              </dt>

              <dd className="mt-1 font-medium">
                {formatDate(message.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <button
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to Messages
        </button>
      </div>
    </div>
  );
}
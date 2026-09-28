"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  getMessages,
  Message,
} from "@/lib/api";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";
import { messageColumns } from "./columns";

export function MessageTable() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await getMessages(token, {
        status: status || undefined,
      });

      setMessages(response.messages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return messages;
    }

    return messages.filter((message) => {
      return (
        message.subject?.toLowerCase().includes(value) ||
        message.body.toLowerCase().includes(value) ||
        message.customer_name
          ?.toLowerCase()
          .includes(value) ||
        message.group_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [messages, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages..."
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-sm"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All statuses</option>
            <option value="SENT">Sent</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <Link
          href="/advisor-dashboard/messages/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Message
        </Link>
      </div>

      {loading ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          Loading messages...
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          {search || status
            ? "No messages match your filters."
            : "No messages found."}
        </div>
      ) : (
        <EnterpriseTable
          columns={messageColumns}
          data={filteredMessages}
          emptyMessage="No messages match your filters."
          searchPlaceholder="Search messages..."
        />
      )}
    </div>
  );
}
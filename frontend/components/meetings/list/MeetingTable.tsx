"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";
import { getMessages, type Message } from "@/lib/api";

import { messageColumns } from "./columns";

export function MessageTable() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const response = await getMessages(token);

      console.log("Messages loaded:", response);

      setMessages(response.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load messages."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    const value = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !value ||
        [
          message.subject,
          message.body,
          message.message_type,
          message.status,
          message.customer_name,
          message.group_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        !status || message.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, status]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages..."
            className="h-10 w-full rounded-lg border border-line bg-bone px-3 text-sm outline-none transition placeholder:text-ash focus:border-obsidian sm:max-w-md"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-line bg-bone px-3 text-sm outline-none transition focus:border-obsidian"
          >
            <option value="">All statuses</option>
            <option value="SENT">Sent</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMessages}
            className="rounded-lg border border-line bg-bone px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Refresh
          </button>

          <Link
            href="/advisor-dashboard/messages/new"
            className="rounded-lg bg-obsidian px-4 py-2 text-sm font-medium text-bone transition hover:opacity-90"
          >
            New Message
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Loading messages...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-bone p-8 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            {search || status
              ? "No messages match your filters."
              : "No messages found."}
          </p>
        </div>
      ) : (
        <EnterpriseTable
          columns={messageColumns}
          data={filteredMessages}
        />
      )}
    </div>
  );
}
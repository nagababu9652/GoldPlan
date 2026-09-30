"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createMessage,
  getMessage,
  updateMessage,
  getClients,
  getGroups,
  Message,
  Client,
  Group,
} from "@/lib/api";

type Props = {
  messageId?: number;
};

export function MessageForm({ messageId }: Props) {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [message, setMessage] = useState<Message | null>(null);

  const [messageType, setMessageType] =
    useState("CLIENT_MESSAGE");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("SENT");

  const [recipientType, setRecipientType] =
    useState<"CLIENT" | "GROUP">("CLIENT");

  const [customerId, setCustomerId] =
    useState<string>("");

  const [groupId, setGroupId] =
    useState<string>("");

  const [loading, setLoading] = useState(
    Boolean(messageId),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadData() {
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

        const [clientsResponse, groupsResponse] =
          await Promise.all([
            getClients(token, {
              page_size: 100,
            }),
            getGroups(token),
          ]);

        setClients(clientsResponse.clients);
        setGroups(groupsResponse.groups);

        if (messageId) {
          const existing = await getMessage(
            token,
            messageId,
          );

          setMessage(existing);
          setMessageType(existing.message_type);
          setSubject(existing.subject || "");
          setBody(existing.body);
          setStatus(existing.status);

          if (existing.customer_id) {
            setRecipientType("CLIENT");
            setCustomerId(
              String(existing.customer_id),
            );
          } else if (existing.customer_group_id) {
            setRecipientType("GROUP");
            setGroupId(
              String(existing.customer_group_id),
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load message form.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [messageId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem(
        "finplan_token",
      );

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      if (!body.trim()) {
        throw new Error("Message body is required.");
      }

      if (
        recipientType === "CLIENT" &&
        !customerId
      ) {
        throw new Error(
          "Please select a client.",
        );
      }

      if (
        recipientType === "GROUP" &&
        !groupId
      ) {
        throw new Error(
          "Please select a group.",
        );
      }

      if (messageId) {
        await updateMessage(token, messageId, {
          subject: subject.trim() || null,
          body: body.trim(),
          status,
        });

        router.push(
          `/advisor-dashboard/messages/${messageId}`,
        );
      } else {
        const created = await createMessage(token, {
          message_type: messageType,
          subject: subject.trim() || null,
          body: body.trim(),
          status: "SENT",
          customer_id:
            recipientType === "CLIENT"
              ? Number(customerId)
              : null,
          customer_group_id:
            recipientType === "GROUP"
              ? Number(groupId)
              : null,
        });

        router.push(
          `/advisor-dashboard/messages/${created.id}`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save message.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dashboard-form-shell space-y-3"
    >
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="dashboard-form-section p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-obsidian">
            Message Details
          </h2>

          <p className="mt-1 text-sm text-ash">
            Compose the message and choose the correct recipient.
          </p>
        </div>

        {!messageId ? (
        <div className="space-y-2">
          <label className="dashboard-form-label">
            Message Type
          </label>

          <select
            value={messageType}
            onChange={(event) =>
              setMessageType(event.target.value)
            }
            className="dashboard-form-control"
          >
            <option value="CLIENT_MESSAGE">
              Client Message
            </option>
            <option value="FOLLOW_UP">
              Follow Up
            </option>
            <option value="GENERAL">
              General
            </option>
            <option value="INTERNAL">
              Internal
            </option>
          </select>
        </div>
      ) : null}

      {!messageId ? (
        <div className="space-y-3">
          <label className="dashboard-form-label">
            Recipient
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-obsidian">
              <input
                type="radio"
                checked={
                  recipientType === "CLIENT"
                }
                onChange={() => {
                  setRecipientType("CLIENT");
                  setGroupId("");
                }}
              />
              Client
            </label>

            <label className="flex items-center gap-2 text-sm text-obsidian">
              <input
                type="radio"
                checked={
                  recipientType === "GROUP"
                }
                onChange={() => {
                  setRecipientType("GROUP");
                  setCustomerId("");
                }}
              />
              Group
            </label>
          </div>
        </div>
      ) : null}

      {!messageId &&
      recipientType === "CLIENT" ? (
        <div className="space-y-2">
          <label className="dashboard-form-label">
            Client
          </label>

          <select
            value={customerId}
            onChange={(event) =>
              setCustomerId(event.target.value)
            }
            className="dashboard-form-control"
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
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!messageId &&
      recipientType === "GROUP" ? (
        <div className="space-y-2">
          <label className="dashboard-form-label">
            Group
          </label>

          <select
            value={groupId}
            onChange={(event) =>
              setGroupId(event.target.value)
            }
            className="dashboard-form-control"
          >
            <option value="">
              Select group
            </option>

            {groups
              .filter((group) => group.is_active)
              .map((group) => (
                <option
                  key={group.id}
                  value={group.id}
                >
                  {group.group_name}
                </option>
              ))}
          </select>
        </div>
      ) : null}

      {messageId && message ? (
        <div className="rounded-md bg-muted/50 p-4 text-sm">
          <div className="font-medium">
            Recipient
          </div>

          <div className="mt-1 text-muted-foreground">
            {message.customer_name ||
              message.group_name ||
              "—"}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="dashboard-form-label">
          Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(event) =>
            setSubject(event.target.value)
          }
          maxLength={250}
          placeholder="Enter message subject"
          className="dashboard-form-control"
        />
      </div>

      <div className="space-y-2">
        <label className="dashboard-form-label">
          Message
        </label>

        <textarea
          value={body}
          onChange={(event) =>
            setBody(event.target.value)
          }
          rows={8}
          placeholder="Write your message..."
          className="dashboard-form-control dashboard-form-textarea"
        />
      </div>

      {messageId ? (
        <div className="space-y-2">
          <label className="dashboard-form-label">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="dashboard-form-control"
          >
            <option value="SENT">Sent</option>
            <option value="READ">Read</option>
            <option value="ARCHIVED">
              Archived
            </option>
          </select>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="dashboard-form-action border border-line bg-bone text-obsidian"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="dashboard-form-action bg-obsidian text-bone disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : messageId
              ? "Save Changes"
              : "Send Message"}
        </button>
      </div>
      </section>
    </form>
  );
}
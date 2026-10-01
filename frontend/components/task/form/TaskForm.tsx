"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import {
  createTask,
  getClients,
  getGroups,
  updateTask,
  type Client,
  type Group,
  type Task,
  type TaskCreatePayload,
  type TaskUpdatePayload,
} from "@/lib/api";

type TaskFormProps = {
  task?: Task;
};

function toLocalDateTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function TaskForm({
  task,
}: TaskFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEdit = Boolean(task);

  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [title, setTitle] = useState(task?.title ?? searchParams.get("title") ?? "");
  const [taskType, setTaskType] = useState(
    task?.task_type ?? "FOLLOW_UP"
  );
  const [description, setDescription] = useState(
    task?.description ?? ""
  );
  const [dueAt, setDueAt] = useState(
    toLocalDateTime(task?.due_at)
  );
  const [priority, setPriority] = useState(
    task?.priority ?? "MEDIUM"
  );
  const [status, setStatus] = useState(
    task?.status ?? "PENDING"
  );
  const [notes, setNotes] = useState(
    task?.notes ?? ""
  );

  const [customerId, setCustomerId] = useState(
    task?.customer_id
      ? String(task.customer_id)
      : searchParams.get("customer_id") ?? ""
  );

  const [groupId, setGroupId] = useState(
    task?.customer_group_id
      ? String(task.customer_group_id)
      : searchParams.get("customer_group_id") ?? ""
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const [clientResponse, groupResponse] =
          await Promise.all([
            getClients(token, {
              page_size: 100,
              page: 1,
            }),
            getGroups(token),
          ]);

        setClients(clientResponse.clients);
        setGroups(groupResponse.groups);
      } catch (err) {
        console.error(
          "Failed to load task options:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients and groups."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      if (!title.trim()) {
        setError("Task title is required.");
        return;
      }

      if (!dueAt) {
        setError("Due date and time are required.");
        return;
      }

      if (!customerId && !groupId) {
        setError(
          "Select either a client or a group."
        );
        return;
      }

      const payload: TaskCreatePayload & TaskUpdatePayload = {
        title: title.trim(),
        task_type: taskType,
        description:
          description.trim() || null,
        due_at: new Date(dueAt).toISOString(),
        priority,
        status,
        notes: notes.trim() || null,
        customer_id: customerId
          ? Number(customerId)
          : null,
        customer_group_id: groupId
          ? Number(groupId)
          : null,
      };

      if (isEdit && task) {
        await updateTask(token, task.id, payload);

        router.push(
          `/advisor-dashboard/tasks/${task.id}`
        );
      } else {
        const created = await createTask(
          token,
          payload
        );

        router.push(
          `/advisor-dashboard/tasks/${created.id}`
        );
      }

      router.refresh();
    } catch (err) {
      console.error("Failed to save task:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-bone p-8 text-center">
        <p className="text-sm text-ash">
          Loading form...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dashboard-form-shell space-y-3"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <section className="dashboard-form-section p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-obsidian">
            Task Information
          </h2>

          <p className="mt-1 text-sm text-ash">
            Capture the essentials for this task and assign it to a client or group.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="dashboard-form-label">
              Task Title
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Follow up on financial plan"
              className="dashboard-form-control"
              required
            />
          </div>

          <div>
            <label className="dashboard-form-label">
              Task Type
            </label>

            <select
              value={taskType}
              onChange={(event) =>
                setTaskType(event.target.value)
              }
              className="dashboard-form-control"
            >
              <option value="FOLLOW_UP">
                Follow Up
              </option>
              <option value="CALL">
                Call
              </option>
              <option value="EMAIL">
                Email
              </option>
              <option value="DOCUMENT">
                Document
              </option>
              <option value="REVIEW">
                Review
              </option>
              <option value="REMINDER">
                Reminder
              </option>
              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

        <div>
          <label className="dashboard-form-label">
            Due Date & Time
          </label>

          <input
            type="datetime-local"
            value={dueAt}
            onChange={(event) =>
              setDueAt(event.target.value)
            }
            className="dashboard-form-control"
            required
          />
        </div>

        <div>
          <label className="dashboard-form-label">
            Priority
          </label>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            className="dashboard-form-control"
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
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
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="COMPLETED">
              Completed
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div>
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

        <div>
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

        <div className="lg:col-span-2">
          <label className="dashboard-form-label">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            placeholder="Describe what needs to be done..."
            className="dashboard-form-control dashboard-form-textarea"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="dashboard-form-label">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={3}
            placeholder="Internal notes..."
            className="dashboard-form-control dashboard-form-textarea"
          />
        </div>
      </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
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
            : isEdit
            ? "Update Task"
            : "Create Task"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

import {
  completeTask,
  reopenTask,
  type Task,
} from "@/lib/api";

type TaskDetailProps = {
  task: Task;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function isOverdue(task: Task) {
  return (
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED" &&
    new Date(task.due_at).getTime() <
      Date.now()
  );
}

function priorityClass(priority: string) {
  switch (priority.toUpperCase()) {
    case "HIGH":
      return "bg-red-100 text-red-700";

    case "LOW":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function TaskDetail({
  task: initialTask,
}: TaskDetailProps) {
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    try {
      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      setLoading(true);
      setError("");

      const updated = await completeTask(
        token,
        task.id
      );

      setTask(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete task."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen() {
    try {
      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      setLoading(true);
      setError("");

      const updated = await reopenTask(
        token,
        task.id
      );

      setTask(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reopen task."
      );
    } finally {
      setLoading(false);
    }
  }

  const overdue = isOverdue(task);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                task.status
              )}`}
            >
              {task.status.replace(/_/g, " ")}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            {task.title}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {task.task_type}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/advisor-dashboard/tasks"
            className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium hover:bg-muted"
          >
            Back
          </Link>

          <Link
            href={`/advisor-dashboard/tasks/${task.id}/edit`}
            className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium hover:bg-muted"
          >
            Edit
          </Link>

          {task.status === "COMPLETED" ? (
            <button
              type="button"
              onClick={handleReopen}
              disabled={loading}
              className="h-10 rounded-lg bg-obsidian px-4 text-sm font-medium text-bone disabled:opacity-50"
            >
              {loading
                ? "Updating..."
                : "Reopen"}
            </button>
          ) : task.status !==
              "CANCELLED" ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="h-10 rounded-lg bg-obsidian px-4 text-sm font-medium text-bone disabled:opacity-50"
            >
              {loading
                ? "Updating..."
                : "Complete"}
            </button>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {overdue && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            This task is overdue.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-line bg-bone p-6">
            <h2 className="text-lg font-semibold">
              Task Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-ash">
                  Due
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    overdue
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {formatDateTime(task.due_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-ash">
                  Completed
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(
                    task.completed_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-ash">
                  Client
                </p>
                <p className="mt-1 text-sm font-medium">
                  {task.customer_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-ash">
                  Group
                </p>
                <p className="mt-1 text-sm font-medium">
                  {task.group_name || "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-bone p-6">
            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {task.description || "No description."}
            </p>
          </section>

          <section className="rounded-xl border border-line bg-bone p-6">
            <h2 className="text-lg font-semibold">
              Notes
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {task.notes || "No notes."}
            </p>
          </section>
        </div>

        <aside className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Record Details
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs text-ash">
                Task ID
              </p>
              <p className="mt-1 text-sm font-medium">
                #{task.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-ash">
                Created
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDateTime(
                  task.created_at
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-ash">
                Last Updated
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDateTime(
                  task.updated_at
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-ash">
                Assigned Employee
              </p>
              <p className="mt-1 text-sm font-medium">
                #{task.assigned_employee_id}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
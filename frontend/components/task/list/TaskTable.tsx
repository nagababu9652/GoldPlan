"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";
import {
  completeTask,
  getTasks,
  reopenTask,
  type Task,
} from "@/lib/api";

import { taskColumns } from "./columns";

export default function TaskTable() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const response = await getTasks(token, {
        status: status || undefined,
        priority: priority || undefined,
      });

      setTasks(response.tasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, [status, priority]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return tasks;
    }

    return tasks.filter((task) =>
      [
        task.title,
        task.task_type,
        task.description,
        task.customer_name,
        task.group_name,
        task.priority,
        task.status,
        task.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [tasks, search]);

  async function handleComplete(task: Task) {
    try {
      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      setActionLoading(task.id);

      const updated = await completeTask(token, task.id);

      setTasks((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (err) {
      console.error("Failed to complete task:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete task."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReopen(task: Task) {
    try {
      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      setActionLoading(task.id);

      const updated = await reopenTask(token, task.id);

      setTasks((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch (err) {
      console.error("Failed to reopen task:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to reopen task."
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-full rounded-lg border border-line bg-bone px-3 text-sm outline-none focus:ring-2 focus:ring-black/10 sm:max-w-sm"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-line bg-bone px-3 text-sm outline-none"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="h-10 rounded-lg border border-line bg-bone px-3 text-sm outline-none"
          >
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadTasks}
            className="h-10 rounded-lg border border-line bg-bone px-4 text-sm font-medium hover:bg-muted"
          >
            Refresh
          </button>

          <Link
            href="/advisor-dashboard/tasks/new"
            className="inline-flex h-10 items-center rounded-lg bg-obsidian px-4 text-sm font-medium text-bone hover:opacity-90"
          >
            New Task
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Loading tasks...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-bone p-8 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            {search || status || priority
              ? "No tasks match your filters."
              : "No tasks found."}
          </p>

          {!search && !status && !priority && (
            <Link
              href="/advisor-dashboard/tasks/new"
              className="mt-4 inline-flex rounded-lg bg-obsidian px-4 py-2 text-sm font-medium text-bone"
            >
              Create your first task
            </Link>
          )}
        </div>
      ) : (
        <>
          <EnterpriseTable
            columns={taskColumns}
            data={filteredTasks}
          />

          <div className="flex flex-wrap gap-2">
            {filteredTasks
              .filter(
                (task) =>
                  task.status !== "CANCELLED"
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="hidden"
                >
                  {actionLoading === task.id
                    ? "Loading"
                    : task.status === "COMPLETED"
                    ? "Reopen"
                    : "Complete"}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
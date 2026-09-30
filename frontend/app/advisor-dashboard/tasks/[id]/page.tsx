"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getTask,
  type Task,
} from "@/lib/api";

import { TaskDetail } from "@/components/task/detail";

export default function TaskDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [task, setTask] = useState<Task | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTask() {
      try {
        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const response = await getTask(token, id);

        setTask(response);
      } catch (err) {
        console.error(
          "Failed to load task:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load task."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTask();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Task details
        </div>
        <p className="mt-4 text-sm text-ash">Loading task...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-red-200 bg-red-50 text-red-600">
          Task details
        </div>
        <p className="mt-4 text-sm text-red-600">
          {error || "Task not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="dashboard-panel p-4 lg:p-5">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Task overview
        </div>
      </div>

      <TaskDetail task={task} />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getTask,
  type Task,
} from "@/lib/api";

import { TaskForm } from "@/components/task/form";

export default function EditTaskPage() {
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
      <div className="rounded-xl border border-line bg-bone p-8 text-center">
        Loading task...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-xl border border-red-200 bg-bone p-8 text-center">
        <p className="text-sm text-red-600">
          {error || "Task not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Task update
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Edit Task
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Update task details and follow-up information.
        </p>
      </div>

      <TaskForm task={task} />
    </div>
  );
}
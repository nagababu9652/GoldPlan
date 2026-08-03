import { Task } from "./task.types";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch tasks: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Task[]>;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete task: ${res.status} ${res.statusText}`
    );
  }
}